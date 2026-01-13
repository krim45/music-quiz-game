export type ChatMessage = {
  from: string;
  color: string;
  message: string;
};

export type Player = {
  playerId: string; // 고정 유저 ID (localStorage에서 유지)
  socketId: string | null; // 현재 연결된 socket.id (없으면 null)
  nickname: string;
  color: string;
  score: number;
  ready: boolean;
  isOwner: boolean;
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

export type RoomInfo = {
  room: RoomInfoDTO;
  playlist: PlaylistDTO;
};

export type RoomInfoDTO = {
  id: string;
  title: string;
  // curPlayers: number;
  // maxPlayers: number;
  hasPassword: boolean;
  status: RoomStatus;
  songCount: number;
};

export type PlaylistDTO = {
  id: string;
  name: string;
  description: string | null;
};

export type Song = {
  id: string;
  url: string;
  singer: string;
  title: string;
  extraAnswers?: string | null;
};

export type PlaylistItem = {
  startSeconds: number;
} & Song;

export type RoomInfoResponse =
  | { ok: true; data: { room: RoomInfoDTO; playlist: PlaylistDTO } }
  | { ok: false; message: string };
