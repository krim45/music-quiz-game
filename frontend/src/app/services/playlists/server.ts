import 'server-only';

import type { FindPlaylistsParams, FindPlaylistsResponse } from '@/app/services/playlists/types';
import { buildPlaylistsQuery } from '@/app/services/playlists/buildUrl';

export async function fetchPlaylistsServer(params: FindPlaylistsParams): Promise<FindPlaylistsResponse> {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) throw new Error('API_BASE_URL is not set');

  const qs = buildPlaylistsQuery(params);
  const url = `${baseUrl}/playlists?${qs}`;

  const res = await fetch(url, { cache: 'no-store' });
  const data: FindPlaylistsResponse = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'playlists fetch failed');
  }

  return data;
}
