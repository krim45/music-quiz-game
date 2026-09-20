import { AppDataSource } from '@/db/AppDataSource';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';
import { Song } from '@/entities/Song';
import { HttpError } from '@/errors/HttpError';
import { type SongPayload, upsertSongWithManager } from '@/services/songs';
import type { PlaylistDTO } from '@music-quiz/shared';
import type { PlaylistItem } from '@/types';

export type CreatePlaylistSongInput = { songId?: string } & SongPayload;

export type CreatePlaylistInput = {
  name: string;
  description?: string;
  songs: CreatePlaylistSongInput[];
};

export async function createPlaylist(input: CreatePlaylistInput) {
  const name = (input.name ?? '').trim();
  const description = (input.description ?? '').trim();
  const songs = input.songs ?? [];

  if (!name) throw new HttpError(400, 'name is required');

  if (!Array.isArray(songs) || songs.length === 0) throw new HttpError(400, 'songs is required');

  if (songs.length > 200) throw new HttpError(400, 'too many songs (max 200)');

  const normalizeStart = (n: unknown) => {
    const v = typeof n === 'number' ? n : Number(n ?? 0);
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.floor(v));
  };

  return AppDataSource.transaction(async (manager) => {
    const playlistRepo = manager.getRepository(Playlist);
    const psRepo = manager.getRepository(PlaylistSong);
    const songRepo = manager.getRepository(Song);

    // 1) playlist 생성
    const playlist = await playlistRepo.save(playlistRepo.create({ name, description }));

    // 2) 입력 분리
    //    기존 곡(songId 지정)과 새로 만들 곡을 나눈다.
    const existing: Array<{ songId: string; startSeconds: number }> = [];
    const newPayloads: SongPayload[] = [];

    for (const s of songs) {
      if (s.songId && s.songId.trim()) {
        existing.push({ songId: s.songId.trim(), startSeconds: normalizeStart(s.startSeconds) });
      } else {
        newPayloads.push({
          url: s.url,
          title: s.title,
          singer: s.singer,
          extraAnswers: s.extraAnswers,
          startSeconds: normalizeStart(s.startSeconds),
          endSeconds: s.endSeconds ?? null,
        });
      }
    }

    // 3) 기존 songId 검증 + 원래 시작 지점 조회
    //    담을 때 지정한 값이 곡 자체의 값과 다르면 이 플레이리스트에서만 덮어쓴다.
    const ownStartById = new Map<string, number>();
    if (existing.length > 0) {
      const unique = Array.from(new Set(existing.map((x) => x.songId)));
      const rows = await songRepo
        .createQueryBuilder('song')
        .select(['song.id', 'song.startSeconds'])
        .where('song.id IN (:...ids)', { ids: unique })
        .getMany();

      for (const r of rows) ownStartById.set(r.id, r.startSeconds);

      const missing = unique.filter((id) => !ownStartById.has(id));
      if (missing.length > 0) throw new HttpError(400, `song not found: ${missing.join(', ')}`);
    }

    // 4) 신규 곡 등록 → songId 확보
    //    upsertSongWithManager는 (source, startSeconds)가 같으면 같은 id를 돌려준다.
    //    playlist_songs는 (playlistId, songId) 유니크이므로 여기서 한 번만 담는다.
    const createdIds = new Set<string>();
    const failed: { url: string; reason: string }[] = [];

    for (const payload of newPayloads) {
      const id = await upsertSongWithManager(manager, payload);
      if (!id) {
        failed.push({ url: payload.url, reason: 'invalid youtube url (cannot extract videoId)' });
        continue;
      }
      createdIds.add(id);
    }

    // 5) 플레이리스트에 담기
    //    startSeconds가 null이면 곡 자체의 구간을 쓴다.
    //    songId 기준으로 한 행만 — 신규 upsert 중복·기존 곡 중복·둘의 겹침을 모두 막는다.
    const linkBySongId = new Map<string, { playlistId: string; songId: string; startSeconds: number | null }>();

    for (const songId of createdIds) {
      // 새로 만든 곡은 곡의 구간이 곧 원하는 구간이므로 덮어쓰지 않는다
      linkBySongId.set(songId, { playlistId: playlist.id, songId, startSeconds: null });
    }

    for (const { songId, startSeconds } of existing) {
      if (linkBySongId.has(songId)) continue;
      linkBySongId.set(songId, {
        playlistId: playlist.id,
        songId,
        startSeconds: startSeconds === ownStartById.get(songId) ? null : startSeconds,
      });
    }

    if (linkBySongId.size === 0) throw new HttpError(400, 'no valid songs to add');

    const values = Array.from(linkBySongId.values());

    await psRepo.createQueryBuilder().insert().into(PlaylistSong).values(values).execute();

    return {
      playlist,
      addedCount: values.length,
      failed,
    };
  });
}

export type FindPlaylistsParams = {
  q?: string;
  limit: number;
  offset: number;
};

export type GetPlaylistParams = {
  playlistId: string;
};

export type PlaylistListItem = Pick<Playlist, 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'>;

export async function getPlaylist(params: GetPlaylistParams): Promise<PlaylistDTO | null> {
  const { playlistId } = params;
  const repo = AppDataSource.getRepository(Playlist);

  const playlist = await repo
    .createQueryBuilder('playlist')
    .select(['playlist.id', 'playlist.name', 'playlist.description'])
    .where('playlist.id = :id', { id: playlistId })
    .getOne();

  if (!playlist) return null;

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? null,
  };
}

export async function getPlaylists(
  params: FindPlaylistsParams
): Promise<{ playlists: PlaylistListItem[]; hasMore: boolean }> {
  const repo = AppDataSource.getRepository(Playlist);
  const qb = repo.createQueryBuilder('playlist');

  if (params.q) {
    const q = `%${params.q.toLowerCase()}%`;
    qb.andWhere('LOWER(playlist.name) LIKE :q', { q });
  }

  const rows = await qb
    .orderBy('playlist.createdAt', 'DESC')
    .skip(params.offset)
    .take(params.limit + 1)
    .getMany();

  const hasMore = rows.length > params.limit;
  const playlists = hasMore ? rows.slice(0, params.limit) : rows;

  return { playlists, hasMore };
}

export async function getPlaylistDetail(playlistId: string) {
  const playlistRepo = AppDataSource.getRepository(Playlist);
  const psRepo = AppDataSource.getRepository(PlaylistSong);

  const playlist = await playlistRepo.findOne({ where: { id: playlistId } });
  if (!playlist) throw new HttpError(404, 'playlist not found');

  const rows = await psRepo
    .createQueryBuilder('ps')
    .innerJoinAndSelect('ps.song', 'song')
    .innerJoinAndSelect('song.source', 'source')
    .where('ps.playlistId = :playlistId', { playlistId })
    .getMany();

  // 플레이리스트별 덮어쓰기를 해석한다. null이면 곡 자체의 구간을 쓴다.
  const songs: PlaylistItem[] = rows.map(({ song, startSeconds, endSeconds }) => ({
    songId: song.id,
    provider: song.source.provider,
    externalId: song.source.externalId,
    url: song.source.url,
    title: song.title,
    singer: song.singer,
    extraAnswers: song.extraAnswers,
    startSeconds: startSeconds ?? song.startSeconds,
    endSeconds: endSeconds ?? song.endSeconds ?? null,
  }));

  return { playlist, songs };
}

export async function deletePlaylist(playlistId: string) {
  const id = (playlistId ?? '').trim();
  if (!id) throw new HttpError(400, 'playlistId is required');

  const repo = AppDataSource.getRepository(Playlist);

  const result = await repo.delete({ id });
  if (!result.affected) throw new HttpError(404, 'playlist not found');

  // playlist_songs는 FK cascade로 자동 삭제됨
  return { deleted: true };
}

// export async function updatePlaylist(id: string, input: { name?: string; description?: string | null }) {
//   const repo = AppDataSource.getRepository(Playlist);
//   const playlist = await repo.findOne({ where: { id } });
//   if (!playlist) throw new HttpError(404, 'playlist not found');

//   if (input.name !== undefined) playlist.name = input.name;
//   if (input.description !== undefined) playlist.description = input.description;

//   return repo.save(playlist);
// }

// export async function deletePlaylist(id: string) {
//   const result = await AppDataSource.getRepository(Playlist).delete({ id });
//   if (result.affected === 0) throw new HttpError(404, 'playlist not found');
//   return { deleted: true };
// }

// export async function addSongsToPlaylist(playlistId: string, songIds: string[]): Promise<{ addedCount: number }> {
//   if (songIds.length === 0) return { addedCount: 0 };

//   const playlistRepo = AppDataSource.getRepository(Playlist);
//   const psRepo = AppDataSource.getRepository(PlaylistSong);
//   const songRepo = AppDataSource.getRepository(Song);

//   const playlist = await playlistRepo.findOne({ where: { id: playlistId } });
//   if (!playlist) throw new HttpError(404, 'playlist not found');

//   const songs = await songRepo.find({
//     where: { id: In(songIds) },
//     select: ['id'],
//   });

//   if (songs.length !== songIds.length) {
//     const found = new Set(songs.map((s) => s.id));
//     const missing = songIds.filter((id) => !found.has(id));
//     throw new HttpError(400, `song not found: ${missing.join(', ')}`);
//   }

//   const values = songIds.map((songId) => ({ playlistId, songId }));
//   const dbType = AppDataSource.options.type;

//   if (dbType === 'postgres') {
//     const result = await psRepo
//       .createQueryBuilder()
//       .insert()
//       .into(PlaylistSong)
//       .values(values)
//       .orIgnore('("playlistId","songId") DO NOTHING')
//       .execute();

//     return { addedCount: result.identifiers.length };
//   }

//   const result = await psRepo.createQueryBuilder().insert().into(PlaylistSong).values(values).orIgnore().execute();

//   return { addedCount: result.identifiers.length };
// }

// export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<{ removed: boolean }> {
//   const result = await AppDataSource.getRepository(PlaylistSong).delete({
//     playlistId,
//     songId,
//   });

//   return { removed: Boolean(result.affected) };
// }
