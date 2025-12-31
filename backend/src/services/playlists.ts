import { In } from 'typeorm';
import { AppDataSource } from '@/db/AppDataSource';
import { Playlist } from '@/entities/Playlist';
import { PlaylistSong } from '@/entities/PlaylistSong';
import { Song } from '@/entities/Song';
import { HttpError } from '@/errors/HttpError';

export async function createPlaylist(input: { name: string; description?: string | null }) {
  const repo = AppDataSource.getRepository(Playlist);
  const playlist = repo.create({
    name: input.name,
    description: input.description ?? null,
  });
  return repo.save(playlist);
}

export async function listPlaylists() {
  return AppDataSource.getRepository(Playlist).find({
    order: { updatedAt: 'DESC' },
  });
}

export async function updatePlaylist(id: string, input: { name?: string; description?: string | null }) {
  const repo = AppDataSource.getRepository(Playlist);
  const playlist = await repo.findOne({ where: { id } });
  if (!playlist) throw new HttpError(404, 'playlist not found');

  if (input.name !== undefined) playlist.name = input.name;
  if (input.description !== undefined) playlist.description = input.description;

  return repo.save(playlist);
}

export async function deletePlaylist(id: string) {
  const result = await AppDataSource.getRepository(Playlist).delete({ id });
  if (result.affected === 0) throw new HttpError(404, 'playlist not found');
  return { deleted: true };
}

export async function addSongsToPlaylist(playlistId: string, songIds: string[]): Promise<{ addedCount: number }> {
  if (songIds.length === 0) return { addedCount: 0 };

  const playlistRepo = AppDataSource.getRepository(Playlist);
  const psRepo = AppDataSource.getRepository(PlaylistSong);
  const songRepo = AppDataSource.getRepository(Song);

  const playlist = await playlistRepo.findOne({ where: { id: playlistId } });
  if (!playlist) throw new HttpError(404, 'playlist not found');

  const songs = await songRepo.find({
    where: { id: In(songIds) },
    select: ['id'],
  });

  if (songs.length !== songIds.length) {
    const found = new Set(songs.map((s) => s.id));
    const missing = songIds.filter((id) => !found.has(id));
    throw new HttpError(400, `song not found: ${missing.join(', ')}`);
  }

  const values = songIds.map((songId) => ({ playlistId, songId }));
  const dbType = AppDataSource.options.type;

  if (dbType === 'postgres') {
    const result = await psRepo
      .createQueryBuilder()
      .insert()
      .into(PlaylistSong)
      .values(values)
      .orIgnore('("playlistId","songId") DO NOTHING')
      .execute();

    return { addedCount: result.identifiers.length };
  }

  const result = await psRepo.createQueryBuilder().insert().into(PlaylistSong).values(values).orIgnore().execute();

  return { addedCount: result.identifiers.length };
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<{ removed: boolean }> {
  const result = await AppDataSource.getRepository(PlaylistSong).delete({
    playlistId,
    songId,
  });

  return { removed: Boolean(result.affected) };
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
