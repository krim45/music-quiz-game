// backend/src/types.ts
//
// 서버 전용 타입만 둔다.
// 프론트엔드와 공유하는 소켓 계약은 @music-quiz/shared 에 있다.
// 여기 있는 타입이 그대로 네트워크로 나가면 안 된다 — 정답(singer/title/extraAnswers),
// 접속 정보(ip/socketId), 타이머 핸들이 섞여 있다.

import type { SourceProvider } from '@/entities/Source';
import type { PlayerId, RoomId, RoomStatus } from '@music-quiz/shared';

/** ---------- domain (server-side) ---------- */

/**
 * 서버가 들고 있는 플레이어. 클라이언트로 내려보낼 때는
 * @music-quiz/shared 의 `Player`로 좁혀서 직렬화한다.
 */
export type ServerPlayer = {
  ip: string;
  playerId: PlayerId; // 서버 발급 고정 ID
  socketId: string | null; // 서버 런타임 연결 정보
  nickname: string;
  color: string;
  score: number;
  isOwner: boolean;
  lastCorrectAtMs?: number | null;
};

/**
 * 플레이리스트에서 꺼낸, 재생 준비가 끝난 곡 하나.
 *
 * 영상(Source)과 곡(Song)을 조인하고 플레이리스트별 구간 덮어쓰기까지 적용한 결과다.
 * 정답(title/singer/extraAnswers)을 포함하므로 클라이언트로 그대로 내보내지 말 것 —
 * 재생에 필요한 것만 추린 RoundSong(@music-quiz/shared)을 쓴다.
 */
export type PlaylistItem = {
  songId: string;
  provider: SourceProvider;
  externalId: string;
  url: string;
  title: string;
  singer: string;
  extraAnswers: string[];
  /** 덮어쓰기가 적용된 최종 시작 지점 */
  startSeconds: number;
  endSeconds?: number | null;
};

/** ---------- game runtime (server-only) ---------- */

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

  players: Map<PlayerId, ServerPlayer>;
  songList: PlaylistItem[];
  currentSongIndex: number;

  runtime: RoomRuntime;
  bans?: Map<string, BanEntry>; // sid 기준 밴 저장소(런타임)
};

export type BanEntry = {
  sid: string;
  ipPrefix: string; // ex) 203.0.113.0/24, 2001:db8:abcd::/64
  uaHash: string; // user-agent hash
  bannedAt: number;
  expiresAt: number;
};

/** socket.id -> 참여 중인 방 매핑 (RoomManager 내부용) */
export type SocketRoom = {
  roomId: RoomId;
  playerId: PlayerId;
};
