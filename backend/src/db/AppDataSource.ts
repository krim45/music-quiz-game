import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Song } from '@/entities/Song';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';

const isProd = process.env.NODE_ENV === 'production';

/**
 * DB 경로는 NODE_ENV와 분리한다.
 *
 * 마이그레이션은 prod에서만 실행되므로(migrationsRun: isProd) 로컬에서 검증하려면
 * NODE_ENV=production이 필요한데, 그러면 경로까지 /data/prod.db로 바뀌어
 * 로컬에서는 열 수 없었다. DATABASE_PATH로 경로만 따로 지정하면
 * 임시 파일에 마이그레이션 체인 전체를 돌려볼 수 있다.
 *
 *   DATABASE_PATH=/tmp/mig-test.db pnpm migration:run
 *
 * 설정하지 않으면 기존 동작과 동일하다.
 */
const database = process.env.DATABASE_PATH || (isProd ? '/data/prod.db' : 'dev.db');

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database,
  entities: [Song, Playlist, PlaylistSong],
  synchronize: !isProd,
  logging: false,
  migrationsRun: isProd,
  migrations: [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
});
