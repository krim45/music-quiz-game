import { FindPlaylistsParams } from '@/services/playlists/types';

export function buildPlaylistsQuery(params: FindPlaylistsParams) {
  const sp = new URLSearchParams();

  if (params.q) sp.set('q', params.q);
  sp.set('limit', String(params.limit));
  sp.set('offset', String(params.offset));

  return sp.toString();
}
