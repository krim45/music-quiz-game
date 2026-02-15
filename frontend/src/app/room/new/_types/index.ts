export type RoomInfo = {
  title: string;
  password?: string;
  isPublic: boolean;
};

export type CreateRoomPayload = {
  title: string;
  password?: string;
  playlistId: string;
};
