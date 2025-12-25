import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('songs')
@Unique(['videoId']) // 같은 영상 중복 방지
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  videoId!: string;

  @Column()
  url!: string;

  @Column()
  title!: string;

  @Column()
  singer!: string;

  @Column({ type: 'text', nullable: true })
  extraAnswers?: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
