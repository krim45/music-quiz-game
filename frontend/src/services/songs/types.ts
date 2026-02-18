export type SongItem = {
  id: string;
  provider: 'youtube';
  externalId: string; // youtube videoId
  url: string;
  title: string;
  singer: string;
  extraAnswers?: string;
  defaultStartSeconds: number;
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

export type SongInfo = {
  id?: string;
  url: string;
  startSeconds?: number;
  singer: string;
  title: string;
  extraAnswers?: string;
  _edit?: string;
  _preview?: string;
};
