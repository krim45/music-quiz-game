export type RoomInfo = {
  title: string;
  password: string;
  isPublic?: boolean;
};

export type SongInfo = {
  url: string;
  startSeconds: string;
  singer: string;
  title: string;
  extraAnswers: string;
  _edit?: string;
};
