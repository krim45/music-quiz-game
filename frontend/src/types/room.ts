export type ChatMessage = {
  from: string;
  color: string;
  message: string;
};

export type Player = {
  id: string;
  nickname: string;
  color: string;
  score: number;
};

export type RoomListItem = {
  roomId: string;
  title: string;
  curPlayers: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: RoomStatus;
};

export type RoomStatus = 'waiting' | 'playing';
