#!/usr/bin/env bash
#
# 운영 SQLite DB를 일관된 스냅샷으로 내려받는다.
#
#   ./scripts/backup-prod-db.sh [출력디렉터리]
#
# 라이브 파일을 그대로 복사하면 쓰기 도중일 때 깨진 사본이 나올 수 있으므로,
# VM에서 VACUUM INTO로 일관된 스냅샷을 먼저 만든 뒤 전송한다.
#
# 용도: 일회성 export.
# 현재 구조(단일 fly 볼륨 위의 SQLite)는 볼륨이 유실되면 복구할 방법이 없어서,
# 저장소를 무엇으로 갈지 정하기 전에 현재 데이터를 안전하게 확보해 두는 것이 목적이다.
# 이 스크립트로 정기 백업 체계를 세우지 말 것 — 그건 취약한 구조를 유지하는 비용이다.
#
# 사전 조건: flyctl 로그인 (flyctl auth login)
#            최초 1회 SSH 발급이 필요할 수 있다 (flyctl ssh issue --agent)

set -euo pipefail

APP="${FLY_APP:-backend-young-fire-5395}"
OUT_DIR="${1:-backups}"
TS="$(date +%Y%m%d-%H%M%S)"
REMOTE_TMP="/data/_snapshot-$TS.db"
OUT="$OUT_DIR/prod-$TS.db"

log() { printf '\033[36m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[31m!!\033[0m %s\n' "$*" >&2; exit 1; }

command -v flyctl >/dev/null || fail "flyctl이 없습니다."
command -v sqlite3 >/dev/null || fail "sqlite3 CLI가 없습니다."

mkdir -p "$OUT_DIR"

# ---- 1. VM에서 일관된 스냅샷 생성 -------------------------------------------
# 따옴표 중첩을 피하려고 base64로 전달한다.
read -r -d '' SNIPPET <<'JS' || true
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('/data/prod.db', sqlite3.OPEN_READONLY, (e) => {
  if (e) { console.error('open: ' + e.message); process.exit(1); }
});
db.run("VACUUM INTO '" + process.env.SNAP_OUT + "'", (e) => {
  if (e) { console.error('vacuum: ' + e.message); process.exit(1); }
  console.log('snapshot-ok');
  process.exit(0);
});
JS

B64="$(printf '%s' "$SNIPPET" | base64 | tr -d '\n')"

log "VM에서 스냅샷 생성 중 ($REMOTE_TMP)"
flyctl ssh console -a "$APP" -C \
  "sh -c 'cd /app/backend && SNAP_OUT=$REMOTE_TMP node -e \"\$(echo $B64 | base64 -d)\"'" \
  || fail "스냅샷 생성 실패"

# ---- 2. 내려받기 ------------------------------------------------------------
log "전송 중 -> $OUT"
flyctl ssh sftp get "$REMOTE_TMP" "$OUT" -a "$APP" || fail "전송 실패"

# ---- 3. 원격 임시파일 정리 (볼륨 용량을 잡아먹지 않도록) ---------------------
log "원격 임시파일 삭제"
flyctl ssh console -a "$APP" -C "rm -f $REMOTE_TMP" || echo "  (삭제 실패 - 수동으로 지워주세요: $REMOTE_TMP)"

# ---- 4. 검증 ----------------------------------------------------------------
log "검증"
[[ -s "$OUT" ]] || fail "받은 파일이 비어 있습니다."

integrity="$(sqlite3 "$OUT" 'PRAGMA integrity_check' 2>&1)"
[[ "$integrity" == "ok" ]] || fail "integrity_check 실패: $integrity"
echo "  integrity_check: ok"

for t in songs playlists playlist_songs; do
  n="$(sqlite3 "$OUT" "select count(*) from $t" 2>/dev/null)" || fail "$t 테이블을 읽을 수 없습니다."
  [[ "$n" -gt 0 ]] || fail "$t 가 비어 있습니다. 백업이 잘못됐을 수 있습니다."
  printf '  %-15s %s행\n' "$t" "$n"
done

echo "  적용된 마이그레이션:"
sqlite3 "$OUT" "select name from migrations order by timestamp" | sed 's/^/    /'

printf '\033[32m완료\033[0m %s (%s)\n' "$OUT" "$(du -h "$OUT" | cut -f1)"
