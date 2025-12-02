export type Player = {
  id: string; // socket.id
  nickname: string; // 사용자 닉네임
  color: string; // 고유 색상 (랜덤)
  score: number; // 정답 맞춘 횟수
  ready: boolean;
  isOwner?: boolean; // 방장 여부
};

export type Room = {
  title: string;
  password?: string;
  players: Map<string, Player>;
  songList: Song[];
  currentSongIndex: number;
  status: 'waiting' | 'playing';
  maxPlayers: number;
};

export type RoomListItemDTO = {
  id: string;
  title: string;
  curPlayers: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: 'waiting' | 'playing';
};

export type RoomResponse = {
  ok: boolean;
  roomId?: string;
  message?: string;
};

export type CreateRoomPayload = {
  title: string;
  password?: string;
  songList: Song[];
  maxPlayers: number;
};

export type RoomJoinPayload = {
  roomId: string;
  password?: string;
  nickname: string;
};

export type Song = {
  url: string;
  startSeconds: number;
  singer: string;
  title: string;
  extraAnswers: string;
};
