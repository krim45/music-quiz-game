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
 * 이전에는 SQLite 파일(/data/prod.db)을 썼으나, fly 볼륨 한 개에만 존재해
 * 유실 시 복구할 방법이 없었다. 관리형 Postgres로 옮겨 백업·복제를 위임한다.
 *
 * dev/prod 모두 이 값이 필요하다. 로컬은 Neon의 개발용 브랜치를 쓰면 된다 —
 * 그러면 마이그레이션을 운영 사본 브랜치에 먼저 돌려보는 것도 가능하다.
 */
const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'DATABASE_URL이 설정되지 않았습니다. backend/.env 에 Neon 접속 문자열을 넣으세요.\n' +
      '  DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require'
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
