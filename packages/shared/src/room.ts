/**
 * 방·플레이어 관련 소켓 계약.
 * 여기 있는 타입은 실제로 네트워크를 건너간다. 서버 전용 런타임 상태
 * (타이머, ip, socketId, 밴 목록)는 backend/src/types.ts에 둔다.
 */

export type PlayerId = string;
export type RoomId = string;

export type RoomStatus = 'waiting' | 'playing';

/**
 * 클라이언트에 공개되는 플레이어.
 * 서버 직렬화(RoomManager.broadcastRoomUpdate)가 내려보내는 필드와 정확히 일치해야 한다.
 */
export type Player = {
  playerId: PlayerId;
  nickname: string;
  color: string;
  score: number;
  isOwner: boolean;
};

/** 라운드 재생에 필요한 최소 곡 정보 (정답은 포함하지 않는다) */
export type RoundSong = {
  externalId: string;
  startSeconds: number;
  endSeconds?: number;
};

/** ---------- client -> server ---------- */

export type CreateRoomPayload = {
  title: string;
  password?: string;
  playlistId: string;
  maxPlayers: number;
};

export type RoomJoinPayload = {
  roomId: RoomId;
  nickname: string;
  password?: string;
};

export type RoomInfoPayload = { roomId: RoomId };

/** ---------- server -> client ---------- */

export type RoomResponse = {
  ok: boolean;
  roomId?: RoomId;
  playerId?: PlayerId;
  message?: string;
};

export type RoomListItem = {
  roomId: RoomId;
  title: string;
  curPlayers: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: RoomStatus;
};

export type RoomInfoDTO = {
  id: RoomId;
  title: string;
  hasPassword: boolean;
  status: RoomStatus;
  songCount: number;
};

export type PlaylistDTO = {
  id: string;
  name: string;
  description: string | null;
};

export type RoomInfo = {
  room: RoomInfoDTO;
  playlist: PlaylistDTO;
};

export type RoomInfoResponse = { ok: true; data: RoomInfo } | { ok: false; message: string };

/** `room:update` */
export type RoomUpdateResponse = {
  status: RoomStatus;
  currentSongIndex: number;
  players: Player[];
};

/** `room:list:update` */
export type RoomListUpdate = {
  rooms: RoomListItem[];
};

/** `room:kicked` */
export type RoomKicked = {
  roomId: RoomId;
  message: string;
};

/** ack 콜백의 공통 형태 */
export type Ack = { ok: boolean; message?: string };
