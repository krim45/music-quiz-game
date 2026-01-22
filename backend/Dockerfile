# 1. Node LTS 이미지
FROM node:18-alpine

# 2. 앱 디렉토리
WORKDIR /app

# 3. package.json 먼저 복사 (캐시 활용)
COPY package*.json ./

# 4. 의존성 설치
RUN npm install

# 5. 소스 코드 복사
COPY . .

# 6. TypeScript 쓰는 경우 build
RUN npm run build

# 7. 서버 실행
CMD ["npm", "run", "start"]
