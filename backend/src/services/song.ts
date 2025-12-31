import { AppDataSource } from '@/db/AppDataSource';
import { Song, SongProvider } from '@/entities/Song';
import { extractVideoId } from '@/utils/youtube';

export type SongPayload = {
  url: string;
  title: string;
  singer: string;
  extraAnswers?: string;
};

/**
 * URL에서 videoId를 뽑아 youtube externalId로 저장하고,
 * (provider, externalId) 기준으로 upsert한다.
 *
 * 반환: upsert된 Song의 id(uuid) 또는 null(영상 id 추출 실패)
 */
export async function upsertSong(payload: SongPayload): Promise<string | null> {
  const repo = AppDataSource.getRepository(Song);

  const videoId = extractVideoId(payload.url);
  if (!videoId) return null;

  const provider = SongProvider.YOUTUBE;
  const externalId = videoId;

  // ✅ TypeORM upsert는 결과로 id를 안정적으로 돌려주지 않는 DB가 있어서
  // 1) upsert
  // 2) 다시 조회
  await repo.upsert(
    {
      provider,
      externalId,
      url: payload.url,
      title: payload.title,
      singer: payload.singer,
      extraAnswers: payload.extraAnswers ?? null,
    },
    ['provider', 'externalId']
  );

  const saved = await repo.findOne({
    where: { provider, externalId },
    select: ['id'],
  });

  return saved?.id ?? null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
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

export type SongListItem = Pick<Song, 'id' | 'provider' | 'externalId' | 'url' | 'title' | 'singer' | 'extraAnswers'>;

export async function findSongs(params: FindSongsParams): Promise<{ items: SongListItem[]; hasMore: boolean }> {
  const repo = AppDataSource.getRepository(Song);
  const qb = repo.createQueryBuilder('song');

  if (params.q) {
    const q = `%${params.q.toLowerCase()}%`;
    qb.andWhere('(LOWER(song.title) LIKE :q OR LOWER(song.singer) LIKE :q)', { q });
  }

  const rows = await qb
    .select([
      'song.id',
      'song.provider',
      'song.externalId',
      'song.url',
      'song.title',
      'song.singer',
      'song.extraAnswers',
    ])
    .orderBy('song.title', 'ASC')
    .skip(params.offset)
    .take(params.limit + 1)
    .getMany();

  const hasMore = rows.length > params.limit;
  const items = hasMore ? rows.slice(0, params.limit) : rows;

  return { items, hasMore };
}
