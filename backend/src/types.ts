// backend/src/types.ts
import type { SongProvider } from '@/entities/Song';

/** ---------- primitives ---------- */
export type PlayerId = string;
export type RoomId = string;

/** ---------- domain ---------- */
export type Player = {
  playerId: PlayerId; // 서버 발급 고정 ID
  socketId: string | null; // 서버 런타임 연결 정보
  nickname: string;
  color: string;
  score: number;
  ready: boolean;
  isOwner: boolean;
};

export type PlayerPublic = Omit<Player, 'socketId'>;

export type Song = {
  id?: string;
  externalId: string;
  provider: SongProvider;
  url: string;
  singer: string;
  title: string;
  extraAnswers?: string | null;
};

export type PlaylistItem = Song & {
  startSeconds: number;
  endSeconds?: number;
};

export type RoomStatus = 'waiting' | 'playing';

/** ---------- game runtime (server-only) ---------- */
export type SkipState = { current: number; required: number };

export type GamePhase = 'countdown' | 'round';

/**
 * 서버 Room 런타임 상태를 한 곳에 모음
 * - as 캐스팅 없애기 위해 Room에 "정식 필드"로 포함
 */
export type RoomRuntime = {
  phase: GamePhase;
  roundNonce: number;

  // countdown 관련
  startsAtMs?: number; // game:start에서 내려준 "시작 예정 시각"(옵션)

  // round 관련
  roundStartedAtMs?: number;
  durationSec?: number;
  revealed: boolean;
  hintShown: boolean;

  // skip
  skipVotes: Set<PlayerId>;
  requiredSkipCount: number;

  // timers
  startTimeoutId?: NodeJS.Timeout;
  hintTimeoutId?: NodeJS.Timeout;
  endTimeoutId?: NodeJS.Timeout;
};

export type Room = {
  title: string;
  password?: string;
  playlistId: string;
  status: RoomStatus;
  maxPlayers: number;

  players: Map<PlayerId, Player>;
  songList: PlaylistItem[];
  currentSongIndex: number;

  /** ✅ 서버 런타임은 무조건 존재 */
  runtime: RoomRuntime;
};

/** ---------- socket payloads ---------- */
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

export type RoomResponse = {
  ok: boolean;
  roomId?: RoomId;
  playerId?: PlayerId;
  message?: string;
};

export type RoomListItemDTO = {
  roomId: RoomId;
  title: string;
  curPlayers: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: RoomStatus;
};

export type SocketRoom = {
  roomId: RoomId;
  playerId: PlayerId;
};

export type RoomInfoPayload = { roomId: RoomId };

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

export type RoomInfoResponse =
  | { ok: true; data: { room: RoomInfoDTO; playlist: PlaylistDTO } }
  | { ok: false; message: string };

export type RoomUpdateResponse = {
  status: RoomStatus;
  currentSongIndex: number;
  players: PlayerPublic[];
};

/** ---------- game events ---------- */
/**
 * ✅ 설계 변경 반영:
 * - game:start = 매 라운드 시작 전 4초 준비
 * - game:play = 실제 재생 시작
 */
export type GameStart = {
  currentSongIndex: number;
  startsAtMs: number;
  delayMs: number;
  durationSec: number;
  song: Pick<PlaylistItem, 'externalId' | 'startSeconds' | 'endSeconds'>;
  skip: SkipState;
};

export type GamePlay = {
  currentSongIndex: number;
  roundStartedAtMs: number;
  durationSec: number;
  song: Pick<PlaylistItem, 'externalId' | 'startSeconds' | 'endSeconds'>;
  skip: SkipState;
};

export type GameSkipUpdate = {
  currentSongIndex: number;
  skip: SkipState;
};

export type GameHint = {
  currentSongIndex: number;
  singer: string;
};

export type GameReveal = {
  currentSongIndex: number;
  reason: 'correct' | 'skip' | 'timeout';
  answer: {
    singer: string;
    title: string;
    extraAnswers?: string | null;
  };
  answeredBy?: {
    nickname: string;
    color: string;
  };
};
