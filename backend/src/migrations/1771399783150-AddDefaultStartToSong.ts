import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultStartToSong1771399783150 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableInfo = await queryRunner.query(`PRAGMA table_info(songs)`);
    const columnNames = tableInfo.map((column: any) => column.name);

    // 1. defaultStartSeconds 컬럼이 없으면 추가
    if (!columnNames.includes('defaultStartSeconds')) {
      await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "defaultStartSeconds" INTEGER DEFAULT 0`);
    }

    // 2. defaultEndSeconds 컬럼이 없으면 추가 (현재 에러의 원인)
    if (!columnNames.includes('defaultEndSeconds')) {
      await queryRunner.query(`ALTER TABLE "songs" ADD COLUMN "defaultEndSeconds" INTEGER`);
    }

    // 3. 기존 데이터 동기화
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
    const tableInfo = await queryRunner.query(`PRAGMA table_info(songs)`);
    const columnNames = tableInfo.map((column: any) => column.name);

    if (columnNames.includes('defaultEndSeconds')) {
      await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "defaultEndSeconds"`);
    }
    if (columnNames.includes('defaultStartSeconds')) {
      await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "defaultStartSeconds"`);
    }
  }
}
