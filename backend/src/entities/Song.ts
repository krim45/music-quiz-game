import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum SongProvider {
  YOUTUBE = 'youtube',
  // SPOTIFY = 'spotify',
  // VIMEO = 'vimeo',
}

@Entity('songs')
@Index(['provider', 'externalId'], { unique: true })
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'simple-enum', enum: SongProvider })
  provider!: SongProvider;

  @Column({ type: 'varchar', length: 50 })
  externalId!: string; // videoId

  @Column({ type: 'varchar', length: 1000 })
  url!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 200 })
  singer!: string;

  @Column({ type: 'text', nullable: true })
  extraAnswers?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
