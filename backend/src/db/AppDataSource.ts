import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Song } from '@/entities/Song';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'dev.db',
  entities: [Song, Playlist, PlaylistSong],
  // TODO: 나중에 진짜 서비스 단계 가면 synchronize: false + migration으로 가는 게 좋고, 지금은 신경 안 써도 됨
  synchronize: true, // dev에서만
  logging: false,
});
