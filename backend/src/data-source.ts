import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Song } from '@/entities/Song';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'dev.db',
  entities: [Song],
  // TODO: 나중에 진짜 서비스 단계 가면 synchronize: false + migration으로 가는 게 좋고, 지금은 신경 안 써도 됨
  synchronize: true,
  logging: false,
});
