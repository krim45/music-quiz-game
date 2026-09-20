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

- **dev**: `backend/dev.db`, `synchronize: true`. 엔티티에서 스키마가 자동 생성되므로
  파일이 없어도 실행된다. **gitignore 대상이고, 안에 든 데이터는 버려도 되는 테스트 데이터다.**
- **prod**: fly.io 볼륨의 `/data/prod.db`, `synchronize: false`, `migrationsRun: true`.
  **prod 스키마를 바꾸려면 반드시 마이그레이션을 추가해야 한다.** 엔티티만 고치면
  dev에서는 통과하고 prod에서 깨진다.

## 배포

- **backend** → fly.io. `main`에 `backend/**` 변경이 푸시되면
  [deploy-backend-fly.yml](.github/workflows/deploy-backend-fly.yml)이 자동 배포.
- **frontend** → Vercel 연동으로 추정 (`@vercel/analytics` 사용, 레포에 설정 파일 없음). <!-- TODO: 확인 -->
- 작업 브랜치는 `dev`, 배포 트리거는 `main`. 즉 **`main` 머지 = 백엔드 즉시 배포**다.

## 환경변수

backend(`.env`): `PORT`, `NODE_ENV`, `CORS_ORIGINS`(쉼표 구분, 쿠키 기반이라 `*` 불가),
`JWT_SECRET`, `ADMIN_ID`, `ADMIN_PASSWORD`, `API_BASE_URL`
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
