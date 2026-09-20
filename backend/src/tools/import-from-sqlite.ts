/**
 * SQLite 백업 파일의 데이터를 Postgres(DATABASE_URL)로 옮긴다. 일회성 도구.
 *
 *   pnpm --filter backend import:sqlite <sqlite파일경로>
 *
 * 옛 스키마는 "영상 1개 = 곡 1개"였고, 새 스키마는 영상(Source)과 곡(Song)을 분리한다.
 * 옛 곡 한 행이 Source 하나 + Song 하나가 된다.
 *
 * 시작 지점 처리: 옛 구조는 실제 시작점을 playlist_songs에 두고 songs에는 0을 넣어두는
 * 경우가 많았다. 그래서 곡의 대표 시작점은 "그 곡이 담긴 링크들에서 가장 흔한 값"으로 잡고,
 * 그와 다른 링크만 플레이리스트별 덮어쓰기로 남긴다. 어느 플리에도 없으면 defaultStartSeconds를 쓴다.
 *
 * - 대상 테이블이 비어 있을 때만 진행한다 (실수로 두 번 돌려 중복되는 것을 막는다).
 * - FK 때문에 sources -> songs -> playlists -> playlist_songs 순서로 넣는다.
 * - 한 트랜잭션으로 처리해, 중간에 실패하면 아무것도 남지 않는다.
 * - createdAt/updatedAt 같은 원본 타임스탬프를 그대로 보존한다.
 */
import 'dotenv/config';
import 'reflect-metadata';
import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
import { AppDataSource } from '@/db/AppDataSource';
import { Source } from '@/entities/Source';
import { Song } from '@/entities/Song';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';

type Row = Record<string, unknown>;

function readAll(db: sqlite3.Database, sql: string): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows as Row[])));
  });
}

/** 옛 extraAnswers는 쉼표로 이은 문자열이었다. 배열로 바꾼다. */
function splitExtraAnswers(v: string | null): string[] {
  if (!v) return [];
  return v
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

/** SQLite는 날짜를 문자열로 들고 있다. Postgres timestamp로 넘기려면 Date로 바꾼다. */
function toDate(v: unknown): Date | undefined {
  if (v == null) return undefined;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('사용법: pnpm --filter backend import:sqlite <sqlite파일경로>');
    process.exit(1);
  }

  const sqlite = new sqlite3.Database(file, sqlite3.OPEN_READONLY);

  const [songs, playlists, links] = await Promise.all([
    readAll(sqlite, 'SELECT * FROM songs'),
    readAll(sqlite, 'SELECT * FROM playlists'),
    readAll(sqlite, 'SELECT * FROM playlist_songs'),
  ]);
  sqlite.close();

  console.log(`읽음: songs=${songs.length}, playlists=${playlists.length}, playlist_songs=${links.length}`);

  await AppDataSource.initialize();

  try {
    await AppDataSource.transaction(async (m) => {
      // 안전장치: 비어 있지 않으면 중단한다
      for (const [entity, name] of [
        [Source, 'sources'],
        [Song, 'songs'],
        [Playlist, 'playlists'],
        [PlaylistSong, 'playlist_songs'],
      ] as const) {
        const count = await m.getRepository(entity).count();
        if (count > 0) {
          throw new Error(`${name} 테이블에 이미 ${count}행이 있습니다. 비운 뒤 다시 실행하세요.`);
        }
      }

      // 곡별 대표 시작점: 링크들에서 가장 흔한 값
      const startsBySong = new Map<string, number[]>();
      for (const l of links) {
        const id = l.songId as string;
        const arr = startsBySong.get(id) ?? [];
        arr.push(Number(l.startSeconds ?? 0));
        startsBySong.set(id, arr);
      }
      const canonicalStart = new Map<string, number>();
      for (const r of songs) {
        const id = r.id as string;
        const arr = startsBySong.get(id);
        if (!arr || arr.length === 0) {
          canonicalStart.set(id, Number(r.defaultStartSeconds ?? 0));
          continue;
        }
        const tally = new Map<number, number>();
        for (const v of arr) tally.set(v, (tally.get(v) ?? 0) + 1);
        const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
        canonicalStart.set(id, best);
      }

      // 옛 곡 한 행 -> Source 하나 (옛 스키마가 videoId 유니크였으므로 1:1)
      const sourceIdByOldSong = new Map<string, string>();
      await m.getRepository(Source).insert(
        songs.map((r) => {
          const sourceId = randomUUID();
          sourceIdByOldSong.set(r.id as string, sourceId);
          return {
            id: sourceId,
            provider: r.provider as Source['provider'],
            externalId: r.externalId as string,
            url: r.url as string,
            title: null,
            durationSeconds: null,
            createdAt: toDate(r.createdAt),
            updatedAt: toDate(r.updatedAt),
          };
        })
      );

      await m.getRepository(Song).insert(
        songs.map((r) => ({
          id: r.id as string,
          sourceId: sourceIdByOldSong.get(r.id as string)!,
          title: r.title as string,
          singer: r.singer as string,
          // 옛 구조는 쉼표로 이은 문자열 하나였다
          extraAnswers: splitExtraAnswers(r.extraAnswers as string | null),
          startSeconds: canonicalStart.get(r.id as string) ?? 0,
          endSeconds: r.defaultEndSeconds == null ? null : Number(r.defaultEndSeconds),
          createdAt: toDate(r.createdAt),
          updatedAt: toDate(r.updatedAt),
        }))
      );

      await m.getRepository(Playlist).insert(
        playlists.map((r) => ({
          id: r.id as string,
          name: r.name as string,
          description: (r.description as string | null) ?? null,
          createdAt: toDate(r.createdAt),
          updatedAt: toDate(r.updatedAt),
        }))
      );

      await m.getRepository(PlaylistSong).insert(
        links.map((r) => {
          const songId = r.songId as string;
          const start = Number(r.startSeconds ?? 0);
          const own = canonicalStart.get(songId) ?? 0;
          return {
            id: r.id as string,
            playlistId: r.playlistId as string,
            songId,
            // 곡의 대표 시작점과 같으면 덮어쓰지 않는다
            startSeconds: start === own ? null : start,
            endSeconds: r.endSeconds == null ? null : Number(r.endSeconds),
            createdAt: toDate(r.createdAt),
          };
        })
      );
    });

    // 검증: 원본과 행 수가 일치하는지
    const after = {
      sources: await AppDataSource.getRepository(Source).count(),
      songs: await AppDataSource.getRepository(Song).count(),
      playlists: await AppDataSource.getRepository(Playlist).count(),
      playlist_songs: await AppDataSource.getRepository(PlaylistSong).count(),
    };
    console.log('옮김:', after);

    const expected = {
      sources: songs.length,
      songs: songs.length,
      playlists: playlists.length,
      playlist_songs: links.length,
    };
    const ok = (Object.keys(expected) as (keyof typeof expected)[]).every((k) => after[k] === expected[k]);
    if (!ok) throw new Error(`행 수 불일치. 기대=${JSON.stringify(expected)} 실제=${JSON.stringify(after)}`);

    console.log('완료 — 행 수 일치');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((e) => {
  console.error('실패:', e instanceof Error ? e.message : e);
  process.exit(1);
});
