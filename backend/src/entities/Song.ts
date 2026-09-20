import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Source } from '@/entities/Source';

/**
 * 곡 = 원본 영상의 한 구간.
 *
 * 정답(title/singer/extraAnswers)을 들고 있으므로 클라이언트로 그대로 내보내면 안 된다.
 * 재생에 필요한 최소 정보만 추려서 보낸다(@music-quiz/shared 의 RoundSong).
 */
@Entity('songs')
// 같은 영상의 같은 지점을 중복 등록하지 못하게 한다
@Index(['sourceId', 'startSeconds'], { unique: true })
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  sourceId!: string;

  @ManyToOne(() => Source, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sourceId' })
  source!: Source;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 200 })
  singer!: string;

  /**
   * 제목 외에 정답으로 인정할 표기들.
   * 이전에는 쉼표로 이은 문자열 하나였는데, 정답 자체에 쉼표가 들어가면
   * 잘못 쪼개졌다. Postgres 배열로 저장한다.
   */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  extraAnswers!: string[];

  /** 영상에서 이 곡이 시작하는 지점(초) */
  @Column({ type: 'int', default: 0 })
  startSeconds!: number;

  /** 끝나는 지점(초). null이면 라운드 길이만큼 재생한다. */
  @Column({ type: 'int', nullable: true })
  endSeconds?: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
