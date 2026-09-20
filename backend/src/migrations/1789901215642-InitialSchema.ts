import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1789901215642 implements MigrationInterface {
    name = 'InitialSchema1789901215642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // uuid 기본값(uuid_generate_v4)이 이 확장에 있다. 없으면 CREATE TABLE이 실패한다.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."sources_provider_enum" AS ENUM('youtube')`);
        await queryRunner.query(`CREATE TABLE "sources" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "public"."sources_provider_enum" NOT NULL, "externalId" character varying(50) NOT NULL, "url" character varying(1000) NOT NULL, "title" character varying(300), "durationSeconds" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_85523beafe5a2a6b90b02096443" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9689ca05d16c14336854a0e1f3" ON "sources" ("provider", "externalId") `);
        await queryRunner.query(`CREATE TABLE "songs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sourceId" uuid NOT NULL, "title" character varying(200) NOT NULL, "singer" character varying(200) NOT NULL, "extraAnswers" text array NOT NULL DEFAULT '{}', "startSeconds" integer NOT NULL DEFAULT '0', "endSeconds" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e504ce8ad2e291d3a1d8f1ea2f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ffb9289b7d269323e20ea49d9a" ON "songs" ("sourceId", "startSeconds") `);
        await queryRunner.query(`CREATE TABLE "playlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "description" character varying(500), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a4597f4189a75d20507f3f7ef0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist_songs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playlistId" uuid NOT NULL, "songId" uuid NOT NULL, "startSeconds" integer, "endSeconds" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c381af24b3c13d9b25b63c231c" UNIQUE ("playlistId", "songId"), CONSTRAINT "PK_bd99fdcd269be0f3ad345340eb4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "songs" ADD CONSTRAINT "FK_80700096f1bb9c919881e058d1a" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_songs" ADD CONSTRAINT "FK_b417e94c5022d641c977ef85d8b" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_songs" ADD CONSTRAINT "FK_d6a09d42a96563d9d139b5f7fdf" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playlist_songs" DROP CONSTRAINT "FK_d6a09d42a96563d9d139b5f7fdf"`);
        await queryRunner.query(`ALTER TABLE "playlist_songs" DROP CONSTRAINT "FK_b417e94c5022d641c977ef85d8b"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP CONSTRAINT "FK_80700096f1bb9c919881e058d1a"`);
        await queryRunner.query(`DROP TABLE "playlist_songs"`);
        await queryRunner.query(`DROP TABLE "playlists"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffb9289b7d269323e20ea49d9a"`);
        await queryRunner.query(`DROP TABLE "songs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9689ca05d16c14336854a0e1f3"`);
        await queryRunner.query(`DROP TABLE "sources"`);
        await queryRunner.query(`DROP TYPE "public"."sources_provider_enum"`);
    }

}
