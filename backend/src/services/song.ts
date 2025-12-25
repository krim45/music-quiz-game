import { AppDataSource } from '@/data-source';
import { Song } from '@/entities/Song';
import { extractVideoId } from '@/utils/youtube';

export type SongPayload = {
  url: string;
  title: string;
  singer: string;
  extraAnswers?: string;
};

// TODO: 위치가 여기가 맞나?
function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function upsertSong(payload: SongPayload): Promise<string | null> {
  const repo = AppDataSource.getRepository(Song);
  const videoId = extractVideoId(payload.url);
  if (!videoId) return null;

  await repo.upsert(
    {
      videoId,
      url: payload.url,
      title: payload.title,
      singer: payload.singer,
      extraAnswers: payload.extraAnswers ?? null,
    },
    ['videoId']
  );

  return videoId;
}

export async function upsertSongsInBatches(songList: SongPayload[], batchSize = 10) {
  const safeBatchSize = Math.min(Math.max(batchSize, 1), 50);
  const batches = chunk(songList, safeBatchSize);

  const failed: { url: string; reason: unknown }[] = [];

  for (const batch of batches) {
    const results = await Promise.allSettled(batch.map((song) => upsertSong(song)));

    results.forEach((r, idx) => {
      if (r.status === 'rejected') failed.push({ url: batch[idx].url, reason: r.reason });
    });
  }

  return { failed };
}

export type FindSongsParams = {
  q?: string;
  limit: number;
  offset: number;
};

export async function findSongs(params: FindSongsParams) {
  const repo = AppDataSource.getRepository(Song);
  const qb = repo.createQueryBuilder('song');

  if (params.q) {
    qb.andWhere('(LOWER(song.title) LIKE :q OR LOWER(song.singer) LIKE :q)', { q: `%${params.q.toLowerCase()}%` });
  }

  const items = await qb
    .select(['song.videoId', 'song.url', 'song.title', 'song.singer', 'song.extraAnswers'])
    .orderBy('song.title', 'ASC')
    .skip(params.offset)
    .take(params.limit)
    .getMany();

  const hasMore = items.length === params.limit;

  return {
    items,
    hasMore,
  };
}
