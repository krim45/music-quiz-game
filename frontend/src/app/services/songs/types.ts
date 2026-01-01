export type SongItem = {
  id: string;
  provider: 'youtube';
  externalId: string; // youtube videoId
  url: string;
  title: string;
  singer: string;
  extraAnswers?: string;
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
