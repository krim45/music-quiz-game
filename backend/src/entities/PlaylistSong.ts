import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Playlist } from '@/entities/Playlist';
import { Song } from '@/entities/Song';

/**
 * 플레이리스트에 담긴 곡.
 *
 * startSeconds/endSeconds는 그 플레이리스트에서만 적용되는 덮어쓰기다.
 * null이면 곡 자체의 구간을 쓴다 — 여러 사람이 같은 곡 목록을 공유하므로,
 * 남의 곡 정의를 건드리지 않고 자기 플리에서만 구간을 바꿀 수 있어야 한다.
 */
@Entity('playlist_songs')
@Unique(['playlistId', 'songId'])
export class PlaylistSong {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  playlistId!: string;

  @Column()
  songId!: string;

  @Column({ type: 'int', nullable: true })
  startSeconds?: number | null;

  @Column({ type: 'int', nullable: true })
  endSeconds?: number | null;

  @ManyToOne(() => Playlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlistId' })
  playlist!: Playlist;

  @ManyToOne(() => Song, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'songId' })
  song!: Song;

  @CreateDateColumn()
  createdAt!: Date;
}
