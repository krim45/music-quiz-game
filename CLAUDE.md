# music-quiz-game

유튜브 음원 기반 실시간 멀티플레이 음악 퀴즈 게임. `backend`(Express + Socket.IO)와
`frontend`(Next.js App Router)가 한 저장소에 있지만 **모노레포가 아니라 독립된 두 패키지**다.

## 명령어

패키지 매니저가 다르다. 섞어 쓰면 lock 파일이 깨진다.

| | backend (npm) | frontend (pnpm@10.28.2) |
|---|---|---|
| 설치 | `cd backend && npm install` | `cd frontend && pnpm install` |
| 개발 | `npm run dev` (nodemon, :8081) | `pnpm dev` (next --turbopack, :3000) |
| 빌드 | `npm run build` (tsc + tsc-alias) | `pnpm build` |
| 린트 | — | `pnpm lint` |
| TypeORM CLI | `npm run typeorm -- <cmd>` | — |

프론트엔드에는 테스트 러너가 없다. 변경 검증은 `pnpm lint` + `pnpm build`로 한다.

## 구조

```
backend/src/
  server.ts        DataSource 초기화 → HTTP + Socket 서버 기동
  app.ts           Express 앱 (REST)
  sockets/         실시간 게임 로직. room.ts가 핵심(가장 무거움)
  routers/         REST 엔드포인트 (playlists, songs, admin)
  services/        DB 접근 + 비즈니스 로직
  entities/        TypeORM 엔티티 (Song, Playlist, PlaylistSong)
  migrations/      prod 스키마 변경분
  db/AppDataSource.ts

frontend/src/
  app/             App Router. 라우트별 _components/_hooks/_utils 코로케이션
  components/      공용 UI (button, form, overlay, menu, ...)
  hooks/           공용 훅 (YouTube 플레이어, localStorage 등)
  lib/socket.ts    싱글턴 소켓 클라이언트
  lib/store/       zustand 스토어
  services/        REST 클라이언트 (TanStack Query)
```

경로 별칭은 양쪽 다 `@/`지만 기준이 다르다 — backend는 `src/*`, frontend는 `./src/*`.

## 데이터베이스

SQLite. 환경에 따라 동작이 갈린다:

- **dev**: `backend/dev.db`, `synchronize: true`, 마이그레이션은 실행되지 않는다.
  엔티티에서 스키마가 자동 생성되므로 파일이 없어도 실행된다.
  gitignore 대상이고, 안에 든 데이터는 버려도 되는 테스트 데이터다.
- **prod**: fly.io 볼륨의 `/data/prod.db`, `synchronize: false`, `migrationsRun: true`.
  **prod 스키마를 바꾸려면 반드시 마이그레이션을 추가해야 한다.** 엔티티만 고치면
  dev에서는 통과하고 prod에서 깨진다.

### 마이그레이션 검증

마이그레이션은 prod에서만 실행되므로 잘못 쓰면 운영에서 처음 드러난다.
그래서 DB 경로를 `DATABASE_PATH`로 분리해 두었다 — 임시 파일에 체인 전체를 돌려볼 수 있다.

```bash
# 빈 DB에 전체 체인 실행 후 운영 스키마와 대조
DATABASE_PATH=/tmp/mig-test.db pnpm --filter backend migration:run
sqlite3 /tmp/mig-test.db .schema

# 운영 사본에 적용해 데이터가 보존되는지 확인
cp backend/backup_prod.db /tmp/prod-sim.db
DATABASE_PATH=/tmp/prod-sim.db pnpm --filter backend migration:run

# 적용 현황
DATABASE_PATH=/tmp/mig-test.db pnpm --filter backend migration:show
```

`InitialSchema`는 기존 prod에 기록되어 있지 않아 다음 배포 때 한 번 실행된다.
그래서 모든 구문이 멱등이어야 한다(`IF NOT EXISTS`). 새 마이그레이션을 추가할 때도
운영 사본에 먼저 돌려보고 데이터·스키마가 보존되는지 확인할 것.

DDL은 한 줄로 유지한다. SQLite가 `CREATE` 구문 원문을 그대로 저장하므로,
포맷을 맞춰두면 `.schema` diff로 운영 스키마와 바로 대조할 수 있다.

## 배포

- **backend** → fly.io. `main`에 `backend/**` 변경이 푸시되면
  [deploy-backend-fly.yml](.github/workflows/deploy-backend-fly.yml)이 자동 배포.
- **frontend** → Vercel 연동으로 추정 (`@vercel/analytics` 사용, 레포에 설정 파일 없음). <!-- TODO: 확인 -->
- 작업 브랜치는 `dev`, 배포 트리거는 `main`. 즉 **`main` 머지 = 백엔드 즉시 배포**다.

## 환경변수

backend(`.env`): `PORT`, `NODE_ENV`, `CORS_ORIGINS`(쉼표 구분, 쿠키 기반이라 `*` 불가),
`JWT_SECRET`, `ADMIN_ID`, `ADMIN_PASSWORD`, `API_BASE_URL`
`DATABASE_PATH`(선택) — 지정하면 DB 경로를 덮어쓴다. 마이그레이션 검증용.
frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`

## 컨벤션

- 코드 주석과 UI 문자열은 **한국어**.
- 포맷: [.prettierrc.json](frontend/.prettierrc.json) — 싱글 쿼트, 세미콜론, printWidth 120.
- 소켓 이벤트는 `도메인:동작` 네이밍 (`room:join`, `game:start`, `game:skip:update`).
  클라이언트 → 서버는 ack 콜백으로 `{ ok: boolean }` 응답을 받는 패턴.
- 훅은 `'use client'` 명시. effect 안에서 set-state 하는 패턴은 의도적으로 제거해 왔으므로
  (최근 커밋 참고) 새로 도입하지 말 것.

## 문서

기획·정책·아키텍처 문서는 [docs/](docs/)에 있다. 읽는 규칙은 [docs/README.md](docs/README.md).
작업을 이어받을 때는 [docs/handoff.md](docs/handoff.md)부터 확인한다.
