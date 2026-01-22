import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Song } from '@/entities/Song';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: isProd ? '/data/prod.db' : 'dev.db',
  entities: [Song, Playlist, PlaylistSong],
  synchronize: !isProd,
  logging: false,
});
