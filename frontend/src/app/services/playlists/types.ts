export type FindPlaylistsParams = {
  q?: string;
  limit: number;
  offset: number;
};

export type PlaylistListItem = {
  id: string;
  name: string;
  description: string;
};

export type FindPlaylistsResponse = {
  ok: boolean;
  q: string | null;
  limit: number;
  offset: number;
  hasMore: boolean;
  items: PlaylistListItem[];
  message?: string;
};
