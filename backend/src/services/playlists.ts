import { AppDataSource } from '@/db/AppDataSource';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';
import { Song } from '@/entities/Song';
import { HttpError } from '@/errors/HttpError';
import { type SongPayload, upsertSongWithManager } from '@/services/songs';

export type CreatePlaylistSongInput = { songId: string } | ({ songId?: never } & SongPayload);

export type CreatePlaylistInput = {
  name: string;
  description: string;
  songs: CreatePlaylistSongInput[];
};

export async function createPlaylist(input: CreatePlaylistInput) {
  const name = (input.name ?? '').trim();
  const description = (input.description ?? '').trim();
  const songs = input.songs ?? [];

  if (!name) throw new HttpError(400, 'name is required');

  if (!description) throw new HttpError(400, 'description is required');

  if (!Array.isArray(songs) || songs.length === 0) throw new HttpError(400, 'songs is required');

  if (songs.length > 200) throw new HttpError(400, 'too many songs (max 200)');

  return AppDataSource.transaction(async (manager) => {
    const playlistRepo = manager.getRepository(Playlist);
    const psRepo = manager.getRepository(PlaylistSong);
    const songRepo = manager.getRepository(Song);

    // 1) playlist 생성
    const playlist = await playlistRepo.save(playlistRepo.create({ name, description }));

    // 2) 입력 분리
    const existingIds: string[] = [];
    const newPayloads: SongPayload[] = [];

    for (const s of songs) {
      if ('songId' in s && typeof s.songId === 'string' && s.songId.trim()) {
        existingIds.push(s.songId.trim());
      } else {
        // 신규 payload로 간주
        newPayloads.push({
          url: (s as SongPayload).url,
          title: (s as SongPayload).title,
          singer: (s as SongPayload).singer,
          extraAnswers: (s as SongPayload).extraAnswers,
        });
      }
    }

    // 3) 기존 songId 검증(존재하는지)
    let verifiedExistingIds: string[] = [];
    if (existingIds.length > 0) {
      const unique = Array.from(new Set(existingIds));
      const rows = await songRepo
        .createQueryBuilder('song')
        .select(['song.id'])
        .where('song.id IN (:...ids)', { ids: unique })
        .getMany();

      const found = new Set(rows.map((r) => r.id));
      const missing = unique.filter((id) => !found.has(id));
      if (missing.length > 0) {
        throw new HttpError(400, `song not found: ${missing.join(', ')}`);
      }

      verifiedExistingIds = unique;
    }

    // 4) 신규 곡 upsert → songId 생성
    const createdIds: string[] = [];
    const failed: { url: string; reason: string }[] = [];

    for (const p of newPayloads) {
      const id = await upsertSongWithManager(manager, p);
      if (!id) {
        failed.push({ url: p.url, reason: 'invalid youtube url (cannot extract videoId)' });
        continue;
      }
      createdIds.push(id);
    }

    const allSongIds = Array.from(new Set([...verifiedExistingIds, ...createdIds]));

    if (allSongIds.length === 0) {
      // 전부 실패한 경우
      throw new HttpError(400, 'no valid songs to add');
    }

    // 5) playlist-song link insert
    const values = allSongIds.map((songId) => ({ playlistId: playlist.id, songId }));
    await psRepo.createQueryBuilder().insert().into(PlaylistSong).values(values).orIgnore().execute();

    return {
      playlist,
      addedCount: values.length,
      failed, // 정책상 일부 실패를 허용한다면 반환
    };
  });
}

export type FindPlaylistsParams = {
  q?: string;
  limit: number;
  offset: number;
};

export type PlaylistListItem = Pick<Playlist, 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'>;

export async function getPlaylists(
  params: FindPlaylistsParams
): Promise<{ items: PlaylistListItem[]; hasMore: boolean }> {
  const repo = AppDataSource.getRepository(Playlist);
  const qb = repo.createQueryBuilder('playlist');

  if (params.q) {
    const q = `%${params.q.toLowerCase()}%`;
    qb.andWhere('LOWER(playlist.name) LIKE :q', { q });
  }

  const rows = await qb
    .select(['playlist.id', 'playlist.name', 'playlist.description'])
    .orderBy('playlist.createdAt', 'DESC')
    .skip(params.offset)
    .take(params.limit + 1)
    .getMany();

  const hasMore = rows.length > params.limit;
  const items = hasMore ? rows.slice(0, params.limit) : rows;

  return { items, hasMore };
}

export async function getPlaylistDetail(playlistId: string) {
  const playlistRepo = AppDataSource.getRepository(Playlist);
  const psRepo = AppDataSource.getRepository(PlaylistSong);

  const playlist = await playlistRepo.findOne({ where: { id: playlistId } });
  if (!playlist) throw new HttpError(404, 'playlist not found');

  const items = await psRepo
    .createQueryBuilder('ps')
    .innerJoinAndSelect('ps.song', 'song')
    .where('ps.playlistId = :playlistId', { playlistId })
    .orderBy('ps.createdAt', 'DESC')
    .getMany();

  return {
    playlist,
    songs: items.map((i) => i.song),
  };
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
