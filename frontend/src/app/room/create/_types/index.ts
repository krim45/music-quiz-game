export type RoomInfo = {
  title: string;
  password?: string;
  isPublic: boolean;
};

export type SongInfo = {
  url: string;
  startSeconds?: number;
  singer: string;
  title: string;
  extraAnswers?: string;
  _edit?: string;
};

export type CreateRoomPayload = {
  title: string;
  password?: string;
  playlistId: string;
};
