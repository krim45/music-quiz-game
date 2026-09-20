import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 초기 스키마.
 *
 * 이 마이그레이션이 없어서 빈 볼륨에서는 prod를 세울 수 없었다.
 * DDL은 운영 백업(backup_prod.db)과 엔티티 동기화본(dev.db)의 스키마가
 * 동일함을 확인한 뒤 원문 그대로 옮긴 것이다. 줄바꿈 없이 한 줄로 유지하는 이유는,
 * SQLite가 CREATE 구문 원문을 그대로 저장하기 때문이다 — 포맷을 맞춰두면
 * 빈 DB에 마이그레이션을 돌린 결과와 운영 스키마를 `.schema` diff로 바로 대조할 수 있다.
 *
 * 기존 prod에는 이 마이그레이션이 기록되어 있지 않으므로 배포 시 한 번 실행된다.
 * 따라서 모든 구문이 멱등이어야 한다 — 인덱스까지 IF NOT EXISTS.
 */
export class InitialSchema1771399000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // FK 대상이 먼저 존재해야 하므로 songs -> playlists -> playlist_songs 순서
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "songs" ("id" varchar PRIMARY KEY NOT NULL, "provider" varchar CHECK( "provider" IN ('youtube') ) NOT NULL, "externalId" varchar(50) NOT NULL, "url" varchar(1000) NOT NULL, "title" varchar(200) NOT NULL, "singer" varchar(200) NOT NULL, "extraAnswers" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "defaultStartSeconds" integer NOT NULL DEFAULT (0), "defaultEndSeconds" integer)`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "playlists" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar(120) NOT NULL, "description" varchar(500), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "playlist_songs" ("id" varchar PRIMARY KEY NOT NULL, "playlistId" varchar NOT NULL, "songId" varchar NOT NULL, "startSeconds" integer NOT NULL DEFAULT (0), "endSeconds" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_2c381af24b3c13d9b25b63c231c" UNIQUE ("playlistId", "songId"), CONSTRAINT "FK_b417e94c5022d641c977ef85d8b" FOREIGN KEY ("playlistId") REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_d6a09d42a96563d9d139b5f7fdf" FOREIGN KEY ("songId") REFERENCES "songs" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_c36684ba94186c0bb9a60e22e3" ON "songs" ("provider", "externalId") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_c36684ba94186c0bb9a60e22e3"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "playlist_songs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "playlists"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "songs"`);
  }
}
