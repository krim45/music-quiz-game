import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Playlist } from '@/entities/Playlist';
import { Song } from '@/entities/Song';

@Entity('playlist_songs')
export class PlaylistSong {
  @PrimaryColumn({ type: 'uuid' })
  playlistId!: string;

  @PrimaryColumn({ type: 'uuid' })
  songId!: string;

  @ManyToOne(() => Playlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlistId' })
  playlist!: Playlist;

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song!: Song;

  @CreateDateColumn()
  createdAt!: Date;
}
