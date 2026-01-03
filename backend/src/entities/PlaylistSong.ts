import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Playlist } from '@/entities/Playlist';
import { Song } from '@/entities/Song';

@Entity('playlist_songs')
@Unique(['playlistId', 'songId'])
export class PlaylistSong {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  playlistId!: string;

  @Column()
  songId!: string;

  @Column({ type: 'int', default: 0 })
  startSeconds!: number;

  @ManyToOne(() => Playlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlistId' })
  playlist!: Playlist;

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song!: Song;

  @CreateDateColumn()
  createdAt!: Date;
}
