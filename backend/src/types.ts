export type Player = {
  playerId: string; // 고정 유저 ID (localStorage에서 유지)
  socketId: string | null; // 현재 연결된 socket.id (없으면 null)
  nickname: string;
  color: string;
  score: number;
  ready: boolean;
  isOwner: boolean; // 방장 여부 (연결 단위, disconnect 시 박탈)
};

export type Song = {
  id?: string;
  url: string;
  singer: string;
  title: string;
  extraAnswers?: string | null;
};

export type PlaylistItem = {
  startSeconds: number;
} & Song;

export type RoomStatus = 'waiting' | 'playing';

export type Room = {
  title: string;
  password?: string;
  players: Map<string, Player>;
  songList: PlaylistItem[];
  currentSongIndex: number;
  status: RoomStatus;
  maxPlayers: number;
};

export type CreateRoomPayload = {
  title: string;
  password?: string;
  playlistId: string;
  maxPlayers: number;
};

export type RoomJoinPayload = {
  roomId: string;
  playerId: string; // ✅ 새로 추가: 고정 유저 ID
  nickname: string;
  password?: string;
};

export type RoomResponse = {
  ok: boolean;
  roomId?: string;
  message?: string;
};

export type RoomListItemDTO = {
  roomId: string;
  title: string;
  curPlayers: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: RoomStatus;
};

export type SocketRoom = {
  roomId: string;
  playerId: string;
};

export type RoomInfoPayload = { roomId: string };

export type RoomInfoResponse = { ok: boolean; room?: RoomListItemDTO; message?: string };
