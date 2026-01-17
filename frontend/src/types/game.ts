export type ChatMessage = {
  from: string;
  color: string;
  message: string;
};

export type Player = {
  playerId: string; // 고정 유저 ID (localStorage에서 유지)
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

export type RoomUpdateResponse = {
  status: RoomStatus;
  currentSongIndex: number;
  players: Player[];
};

export type RoomRuntime = {
  status: RoomStatus;
  currentSongIndex: number;
  players: Player[];
};

export type CurrentSong = {
  externalId: string;
  startSeconds: number;
  endSeconds?: number;
  singer: string;
};

export type SkipState = { current: number; required: number };

export type GameStart = {
  currentSongIndex: number;
  /** 서버 기준 실제 재생이 시작될 시각 (Date.now() 기준 ms) */
  startsAtMs: number;
  /** 라운드 시작 전 준비 시간 */
  delayMs: number;
  /** 이번 라운드 재생 길이 (초) */
  durationSec: number;
  /** 재생에 필요한 최소 정보 */
  song: {
    externalId: string;
    startSeconds: number;
    endSeconds?: number;
  };
  /** 스킵 상태 (실시간 인원 기준) */
  skip: SkipState;
};

export type GamePlay = {
  currentSongIndex: number;
  roundStartedAtMs: number;
  durationSec: number;
  song: {
    externalId: string;
    startSeconds: number;
    endSeconds?: number;
  };
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
