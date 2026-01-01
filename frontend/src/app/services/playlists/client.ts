'use client';

import type { FindPlaylistsParams, FindPlaylistsResponse } from '@/app/services/playlists/types';
import { buildPlaylistsQuery } from '@/app/services/playlists/buildUrl';

export async function fetchPlaylistsClient(params: FindPlaylistsParams): Promise<FindPlaylistsResponse> {
  const qs = buildPlaylistsQuery(params);
  const res = await fetch(`/api/backend/playlists?${qs}`, { cache: 'no-store' });
  const data: FindPlaylistsResponse = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'playlists fetch failed');
  }

  return data;
}
