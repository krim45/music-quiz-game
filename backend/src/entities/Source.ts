import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum SourceProvider {
  YOUTUBE = 'youtube',
  // SPOTIFY = 'spotify',
  // VIMEO = 'vimeo',
}

/**
 * 음원이 담긴 원본 영상.
 *
 * 영상 하나에 곡이 여러 개 들어있는 경우가 있어서(모음 영상 등)
 * 영상과 곡을 분리한다. 유니크 제약은 여기에 있다 — 같은 영상은 한 번만 등록되고,
 * 그 위에 곡(구간)이 여러 개 달린다.
 */
@Entity('sources')
@Index(['provider', 'externalId'], { unique: true })
export class Source {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: SourceProvider })
  provider!: SourceProvider;

  /** 유튜브 videoId */
  @Column({ type: 'varchar', length: 50 })
  externalId!: string;

  @Column({ type: 'varchar', length: 1000 })
  url!: string;

  /** 영상 제목 캐시. 목록 표시와 챕터 파싱에 쓴다. */
  @Column({ type: 'varchar', length: 300, nullable: true })
  title?: string | null;

  /** 영상 길이 캐시(초). 구간의 끝 시간을 검증할 때 쓴다. */
  @Column({ type: 'int', nullable: true })
  durationSeconds?: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
