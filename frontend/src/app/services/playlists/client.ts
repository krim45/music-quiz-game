'use client';

import type {
  FindPlaylistsParams,
  FindPlaylistsResponse,
  PlaylistDetailResponse,
} from '@/app/services/playlists/types';
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
