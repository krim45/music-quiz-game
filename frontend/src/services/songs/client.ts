import { SongsResponse } from '@/services/songs/types';

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

  const res = await fetch(`/api/backend/songs?${qs.toString()}`, {
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
