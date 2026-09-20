import { AppDataSource } from '@/db/AppDataSource';
import { PlaylistSong } from '@/entities/PlaylistSong';
import { Song } from '@/entities/Song';
import { Source, SourceProvider } from '@/entities/Source';
import { HttpError } from '@/errors/HttpError';
import { extractVideoId } from '@/utils/youtube';
import { EntityManager } from 'typeorm';

export type SongPayload = {
  url: string;
  title: string;
  singer: string;
  /** 영상에서 이 곡이 시작하는 지점(초) */
  startSeconds?: number;
  /** 끝나는 지점(초). 비우면 라운드 길이만큼 재생한다. */
  endSeconds?: number | null;
  extraAnswers?: string[];
};

/**
 * 영상(Source)을 찾거나 만든다.
 *
 * 영상 하나에 곡이 여러 개 달릴 수 있으므로, 유니크 제약은 영상에만 있다.
 * 같은 URL이 다시 들어오면 기존 영상을 재사용한다.
 */
export async function findOrCreateSource(
  manager: EntityManager,
  url: string,
  meta?: { title?: string | null; durationSeconds?: number | null }
): Promise<Source | null> {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  const repo = manager.getRepository(Source);
  const provider = SourceProvider.YOUTUBE; // TODO: 추후 다른 플랫폼도 추가

  const existing = await repo.findOne({ where: { provider, externalId: videoId } });
  if (existing) {
    // 메타데이터가 새로 들어왔고 아직 비어 있으면 채워둔다
    const patch: Partial<Source> = {};
    if (meta?.title && !existing.title) patch.title = meta.title;
    if (meta?.durationSeconds && !existing.durationSeconds) patch.durationSeconds = meta.durationSeconds;
    if (Object.keys(patch).length > 0) {
      await repo.update({ id: existing.id }, patch);
      Object.assign(existing, patch);
    }
    return existing;
  }

  return repo.save(
    repo.create({
      provider,
      externalId: videoId,
      url,
      title: meta?.title ?? null,
      durationSeconds: meta?.durationSeconds ?? null,
    })
  );
}

/**
 * 곡을 등록한다. 같은 영상의 같은 지점이면 기존 곡을 재사용한다.
 *
 * 반환: 곡 id, 또는 null(영상 id를 뽑지 못한 경우)
 */
export async function upsertSongWithManager(manager: EntityManager, payload: SongPayload): Promise<string | null> {
  const source = await findOrCreateSource(manager, payload.url);
  if (!source) return null;

  const repo = manager.getRepository(Song);
  const startSeconds = Math.max(0, Math.floor(payload.startSeconds ?? 0));

  const existing = await repo.findOne({
    where: { sourceId: source.id, startSeconds },
    select: ['id'],
  });
  if (existing) return existing.id;

  const saved = await repo.save(
    repo.create({
      sourceId: source.id,
      title: payload.title,
      singer: payload.singer,
      extraAnswers: payload.extraAnswers ?? [],
      startSeconds,
      endSeconds: payload.endSeconds ?? null,
    })
  );

  return saved.id;
}

export async function upsertSong(payload: SongPayload): Promise<string | null> {
  return AppDataSource.transaction((manager) => upsertSongWithManager(manager, payload));
}

export type FindSongsParams = {
  q?: string;
  limit: number;
  offset: number;
};

export type SongListItem = {
  id: string;
  title: string;
  singer: string;
  extraAnswers: string[];
  startSeconds: number;
  endSeconds: number | null;
  provider: SourceProvider;
  externalId: string;
  url: string;
};

export async function findSongs(params: FindSongsParams): Promise<{ items: SongListItem[]; hasMore: boolean }> {
  const repo = AppDataSource.getRepository(Song);
  const qb = repo.createQueryBuilder('song').innerJoinAndSelect('song.source', 'source');

  if (params.q) {
    const q = `%${params.q.toLowerCase()}%`;
    qb.andWhere('(LOWER(song.title) LIKE :q OR LOWER(song.singer) LIKE :q)', { q });
  }

  const rows = await qb
    .orderBy('song.title', 'ASC')
    .skip(params.offset)
    .take(params.limit + 1)
    .getMany();

  const hasMore = rows.length > params.limit;
  const page = hasMore ? rows.slice(0, params.limit) : rows;

  // 선언한 형태로만 내보낸다. 엔티티를 그대로 넘기면 선언에 없는 필드가 새어나간다.
  const items: SongListItem[] = page.map((s) => ({
    id: s.id,
    title: s.title,
    singer: s.singer,
    extraAnswers: s.extraAnswers,
    startSeconds: s.startSeconds,
    endSeconds: s.endSeconds ?? null,
    provider: s.source.provider,
    externalId: s.source.externalId,
    url: s.source.url,
  }));

  return { items, hasMore };
}

export async function deleteSong(songId: string) {
  const id = (songId ?? '').trim();
  if (!id) throw new HttpError(400, 'songId is required');

  return AppDataSource.transaction(async (manager) => {
    const songRepo = manager.getRepository(Song);
    const psRepo = manager.getRepository(PlaylistSong);

    const exists = await songRepo.findOne({ where: { id } });
    if (!exists) throw new HttpError(404, 'song not found');

    await psRepo.delete({ songId: id });
    await songRepo.delete({ id });

    return { deleted: true };
  });
}
