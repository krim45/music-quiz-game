import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultStartToSong1771399783150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 컬럼 추가 (이미 존재할 경우를 대비해 에러 무시 로직은 SQLite에서 수동 처리 필요)
    await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "defaultStartSeconds" INTEGER DEFAULT 0`);

    // 2. 데이터 업데이트
    await queryRunner.query(`
            UPDATE songs 
            SET defaultStartSeconds = (
                SELECT startSeconds 
                FROM playlist_songs 
                WHERE songId = songs.id 
                ORDER BY createdAt DESC 
                LIMIT 1
            )
            WHERE id IN (SELECT DISTINCT songId FROM playlist_songs)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "defaultStartSeconds"`);
  }
}
