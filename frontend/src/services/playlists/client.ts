'use client';

import { buildPlaylistsQuery } from '@/services/playlists/buildUrl';

import type {
  FindPlaylistsParams,
  FindPlaylistsResponse,
  PlaylistDetailResponse,
  CreatePlaylistInput,
  CreatePlaylistResponse,
} from '@/services/playlists/types';

export async function fetchPlaylistsClient(params: FindPlaylistsParams): Promise<FindPlaylistsResponse> {
  const qs = buildPlaylistsQuery(params);
  const res = await fetch(`/api/backend/playlists?${qs}`, { cache: 'no-store' });
  const data: FindPlaylistsResponse = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? 'playlists fetch failed');
  }

  return data;
}

export async function fetchPlaylistDetail({
  id,
  signal,
}: {
  id: string;
  signal?: AbortSignal;
}): Promise<PlaylistDetailResponse> {
  const res = await fetch(`/api/backend/playlists/${id}`, { signal, cache: 'no-store' });
  const data: PlaylistDetailResponse = await res.json();

  if (!data.ok) throw new Error(data.message ?? '플레이리스트 상세 조회 실패');
  return data;
}

export async function createPlaylistClient(input: CreatePlaylistInput): Promise<CreatePlaylistResponse> {
  const res = await fetch(`/api/backend/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(input),
  });

  const data: CreatePlaylistResponse = await res.json();

  if (!data.ok) {
    const msg = data.message ?? 'playlist create failed';
    throw new Error(msg);
  }

  return data;
}
