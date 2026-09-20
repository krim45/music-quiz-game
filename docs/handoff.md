---
title: 작업 인수인계
status: active
updated: 2026-09-20
---

# handoff

컴퓨터를 옮기거나 오랜만에 돌아왔을 때 **여기부터 읽는다.**
세션을 끝낼 때 아래 세 항목을 갱신하고 커밋한다. 길게 쓰지 않는다 — 세 줄이면 된다.

## 지금 하던 것

문서 기반 세팅 중. 단계 0(gitignore·DB 트래킹 정리)과 단계 1(CLAUDE.md, docs 골격) 완료.

## 다음 할 것

- `arch/socket-protocol.md` — `backend/src/sockets/room.ts`에서 이벤트 13개 역추출
- `arch/overview.md`, `policy/game-rules.md`, `arch/data-model.md`
- 그 다음 TO-BE(로드맵·미결 결정) 정리

## 막힌 것 / 결정 필요

- 프론트엔드 배포처가 Vercel인지 확인 필요 (CLAUDE.md의 TODO)
- `dev.db`를 git에서 뺐으므로 시드 스크립트가 필요한지 판단 필요.
  현재 dev 데이터는 11곡/3플레이리스트 수준이고 `synchronize: true`라 스키마는 자동 생성된다.
  운영 데이터 사본은 `backend/backup_prod.db`(169곡, gitignore됨)에 있다.
