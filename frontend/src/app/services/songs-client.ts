export type SongItem = {
  id: string; // ✅ uuid (이걸로 선택/추가)
  provider: 'youtube';
  externalId: string; // ✅ youtube videoId
  url: string;
  title: string;
  singer: string;
  extraAnswers?: string;
};

export type SongsResponse = {
  ok: boolean;
  q: string | null;
  limit: number;
  offset: number;
  hasMore: boolean;
  items: SongItem[];
  message?: string;
};

export async function fetchSongs(params: {
  q?: string;
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
}): Promise<SongsResponse> {
  const qs = new URLSearchParams();

  if (params.q) qs.set('q', params.q);
  qs.set('limit', String(params.limit ?? 50));
  qs.set('offset', String(params.offset ?? 0));

  const res = await fetch(`/api/songs?${qs.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: params.signal,
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? 'songs 조회 실패');
  }

  return data;
}
