# backend는 pnpm 워크스페이스의 일부이고 @music-quiz/shared에 의존한다.
# 따라서 빌드 컨텍스트가 backend/ 가 아니라 "레포 루트"여야 한다.
#
#   flyctl deploy . --config backend/fly.toml --dockerfile backend/Dockerfile
#
# (.github/workflows/deploy-backend-fly.yml 참고)

FROM node:18-alpine

WORKDIR /app

# corepack 대신 명시적 설치 — 구버전 corepack의 서명키 문제를 피한다
RUN npm install -g pnpm@10.28.2

# 1) 매니페스트만 먼저 복사해서 의존성 레이어를 캐시한다.
#    frontend/package.json도 필요하다 — 없으면 워크스페이스가 불완전해져
#    --frozen-lockfile 검증이 실패한다. (설치는 --filter로 제외된다)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# 'backend...' = backend와 그 의존성(@music-quiz/shared)만
RUN pnpm install --frozen-lockfile --filter backend...

# 2) 소스 복사
COPY packages/shared ./packages/shared
COPY backend ./backend

# 3) 빌드 (tsc && tsc-alias)
RUN pnpm --filter backend build

# AppDataSource의 migrations 경로가 'dist/migrations/*.js' (cwd 상대)라
# 실행 시 cwd가 반드시 /app/backend 여야 한다.
WORKDIR /app/backend
CMD ["node", "dist/server.js"]
