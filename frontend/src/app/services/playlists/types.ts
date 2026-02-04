import type { SongInfo, SongItem } from '@/app/services/songs/types';

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

export type PlaylistColumn = PlaylistListItem & {
  _detail: string;
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

export type PlaylistDetailResponse = {
  ok: boolean;
  message?: string;
  playlist: { id: string; name: string; description: string };
  songs: Array<SongItem>;
};

export type CreatePlaylistInput = {
  name: string;
  description?: string;
  songs: SongInfo[];
};

export type CreatePlaylistResponse =
  | {
      ok: true;
      playlist: { id: string; name: string; description: string };
      addedCount: number;
      failed: { url: string; reason: string }[];
    }
  | { ok: false; message: string };
