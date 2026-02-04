import 'server-only';

import type { FindPlaylistsParams, FindPlaylistsResponse } from '@/services/playlists/types';
import { buildPlaylistsQuery } from '@/services/playlists/buildUrl';

export async function fetchPlaylistsServer(params: FindPlaylistsParams): Promise<FindPlaylistsResponse> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error('API_BASE_URL is not set');

  const qs = buildPlaylistsQuery(params);
  const url = `${baseUrl}/playlists?${qs}`;

  const res = await fetch(url, { next: { revalidate: 30 } });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`Fetch 에러 발생 (${res.status}):`, errorBody);
    throw new Error(`서버 에러: ${res.status}`);
  }

  const data: FindPlaylistsResponse = await res.json();

  if (!data.ok) {
    throw new Error(data?.message ?? 'playlists fetch failed');
  }

  return data;
}
