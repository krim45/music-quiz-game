// typeorm CLI는 server.ts를 거치지 않고 이 파일을 직접 로드하므로
// 여기서도 .env를 읽어야 한다.
import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Source } from '@/entities/Source';
import { Song } from '@/entities/Song';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Postgres(Neon) 접속 문자열.
 *
 * 환경마다 "다른 변수"를 본다. 한 변수의 값을 바꿔 끼우면 로컬에 운영 URL이
 * 남아 있어도 알아챌 방법이 없기 때문이다.
 *
 *   개발: DATABASE_URL_DEV   (backend/.env — Neon의 dev 브랜치)
 *   운영: DATABASE_URL       (fly 시크릿 — Neon의 production 브랜치)
 *
 * 덕분에 두 값을 .env에 함께 두고도 NODE_ENV로만 갈린다.
 */
const urlVar = isProd ? 'DATABASE_URL' : 'DATABASE_URL_DEV';
const url = process.env[urlVar];

if (!url) {
  throw new Error(
    `${urlVar}이(가) 설정되지 않았습니다.\n` +
      (isProd
        ? '  운영은 fly 시크릿에 DATABASE_URL을 등록해야 합니다.\n' +
          '    flyctl secrets set DATABASE_URL="postgresql://..." -a <app>'
        : '  backend/.env 에 Neon dev 브랜치 접속 문자열을 넣으세요.\n' +
          '    DATABASE_URL_DEV=postgresql://<user>:<password>@<host>/<db>?sslmode=require\n' +
          '  운영 URL을 여기에 넣지 마세요 — dev는 스키마를 자동으로 맞춥니다.')
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url,
  // Neon은 TLS를 요구한다. 로컬 Postgres로 시험할 때만 sslmode=disable로 끈다.
  ssl: url.includes('sslmode=disable') ? false : { rejectUnauthorized: true },
  entities: [Source, Song, Playlist, PlaylistSong],
  synchronize: !isProd,
  logging: false,
  migrationsRun: isProd,
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
});
