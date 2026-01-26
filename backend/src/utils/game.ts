import type { Server, Socket } from 'socket.io';
import { RoomManager } from '@/sockets/RoomManager';
import type { PlaylistItem, Room, SummaryChatPayload, SystemChatPayload } from '@/types';

const DEFAULT_DURATION_SEC = 60;
const ROUND_START_DELAY_MS = 4000;

type RevealReason = 'correct' | 'timeout' | 'skip';
type AnsweredBy = { playerId: string; nickname: string; color: string; score: number };

export function getClientIp(socket: Socket): string | null {
  const headers = socket.handshake.headers;

  // Fly.io가 보장하는 실제 클라이언트 IP
  const flyIp = headers['fly-client-ip'];
  if (typeof flyIp === 'string' && flyIp.length > 0) {
    return flyIp;
  }

  // 일반 프록시 체인
  const xff = headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }

  // 최후의 fallback (내부 IP일 수 있음)
  return socket.handshake.address ?? null;
}

function computeDurationSec(song: PlaylistItem) {
  const raw = typeof song.endSeconds === 'number' ? song.endSeconds - song.startSeconds : DEFAULT_DURATION_SEC;
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_DURATION_SEC;
  return Math.floor(raw);
}

export function computeRequiredSkipCount(room: Room) {
  return Math.floor(room.players.size / 2) + 1;
}

function bumpNonce(room: Room) {
  room.runtime.roundNonce += 1;
  return room.runtime.roundNonce;
}

function isNonceValid(room: Room, nonce: number) {
  return room.runtime.roundNonce === nonce;
}

function clearTimer(t?: NodeJS.Timeout) {
  if (t) clearTimeout(t);
}

function clearAllTimers(room: Room) {
  clearTimer(room.runtime.startTimeoutId);
  clearTimer(room.runtime.hintTimeoutId);
  clearTimer(room.runtime.endTimeoutId);
  room.runtime.startTimeoutId = undefined;
  room.runtime.hintTimeoutId = undefined;
  room.runtime.endTimeoutId = undefined;
}

function sendSystemChat(io: Server, roomId: string, payload: SystemChatPayload) {
  io.to(roomId).emit('chat:message', {
    type: 'system',
    ...payload,
  });
}

function sendSummaryChat(io: Server, roomId: string, payload: SummaryChatPayload) {
  io.to(roomId).emit('chat:message', {
    type: 'summary',
    ...payload,
  });
}

/**
 * ✅ 라운드를 시작 "예약"한다.
 * - 매 라운드마다 game:start 먼저 emit (4초 카운트다운)
 * - 4초 후 game:play emit + hint/timeout 타이머 시작
 *
 * 정책:
 * - required는 실시간(room.players.size) 기준으로 매번 계산한다.
 * - skipVotes는 라운드마다 초기화하지만, 라운드 중 퇴장한 사람 표는 정리하지 않는다(유효).
 */
export function scheduleRoundStart(io: Server, RoomManager: RoomManager, roomId: string, songIndex: number) {
  const room = RoomManager.get(roomId);
  if (!room) return;
  if (room.status !== 'playing') return;

  const song = room.songList[songIndex];
  if (!song) return;

  // 기존 타이머 정리 후 새 스케줄
  clearAllTimers(room);

  const nonce = bumpNonce(room);
  room.runtime.phase = 'countdown';

  // countdown 시작 시점에 상태 초기화
  room.runtime.revealed = false;
  room.runtime.hintShown = false;

  // 라운드마다 스킵 투표 초기화
  room.runtime.skipVotes = new Set();

  const durationSec = computeDurationSec(song);
  const startsAtMs = Date.now() + ROUND_START_DELAY_MS;

  room.runtime.startsAtMs = startsAtMs;
  room.runtime.durationSec = durationSec;

  // "지금 인원" 기준으로 계산해서 UI에 내려줌
  const requiredNow = computeRequiredSkipCount(room);

  io.to(roomId).emit('game:start', {
    currentSongIndex: songIndex,
    startsAtMs,
    delayMs: ROUND_START_DELAY_MS,
    durationSec,
    skip: { current: 0, required: requiredNow },
    song: {
      externalId: song.externalId,
      startSeconds: song.startSeconds,
      endSeconds: song.endSeconds,
    },
  });

  room.runtime.startTimeoutId = setTimeout(() => {
    const latest = RoomManager.get(roomId);
    if (!latest) return;
    if (latest.status !== 'playing') return;
    if (!isNonceValid(latest, nonce)) return;

    beginRound(io, RoomManager, roomId, songIndex, startsAtMs, durationSec, nonce);
  }, ROUND_START_DELAY_MS);
}

function beginRound(
  io: Server,
  RoomManager: RoomManager,
  roomId: string,
  songIndex: number,
  startsAtMs: number,
  durationSec: number,
  nonce: number
) {
  const room = RoomManager.get(roomId);
  if (!room) return;
  if (room.status !== 'playing') return;
  if (!isNonceValid(room, nonce)) return;

  const song = room.songList[songIndex];
  if (!song) return;

  room.currentSongIndex = songIndex;
  room.runtime.phase = 'round';

  room.runtime.roundStartedAtMs = startsAtMs;
  room.runtime.durationSec = durationSec;

  room.runtime.revealed = false;
  room.runtime.hintShown = false;

  // 라운드 진입 시 초기화
  room.runtime.skipVotes = new Set();

  RoomManager.emitRoomUpdate(io, roomId);

  // required "현재 인원" 기준으로
  const requiredNow = computeRequiredSkipCount(room);

  io.to(roomId).emit('game:play', {
    currentSongIndex: room.currentSongIndex,
    roundStartedAtMs: room.runtime.roundStartedAtMs,
    durationSec: room.runtime.durationSec,
    skip: { current: 0, required: requiredNow },
    song: {
      externalId: song.externalId,
      startSeconds: song.startSeconds,
      endSeconds: song.endSeconds,
    },
  });

  // half-time hint
  const halfMs = Math.floor((durationSec / 2) * 1000);
  room.runtime.hintTimeoutId = setTimeout(() => {
    const latest = RoomManager.get(roomId);
    if (!latest) return;
    if (latest.status !== 'playing') return;
    if (!isNonceValid(latest, nonce)) return;
    if (latest.runtime.phase !== 'round') return;
    if (latest.runtime.revealed) return;
    if (latest.runtime.hintShown) return;
    if (latest.currentSongIndex !== songIndex) return;

    latest.runtime.hintShown = true;
    io.to(roomId).emit('game:hint', {
      currentSongIndex: songIndex,
      singer: song.singer,
    });
  }, halfMs);

  // round timeout
  room.runtime.endTimeoutId = setTimeout(() => {
    const latest = RoomManager.get(roomId);
    if (!latest) return;
    if (latest.status !== 'playing') return;
    if (!isNonceValid(latest, nonce)) return;

    if (latest.runtime.revealed) {
      scheduleNextRound(io, RoomManager, roomId);
      return;
    }

    reveal(io, RoomManager, roomId, 'timeout', undefined);
    scheduleNextRound(io, RoomManager, roomId);
  }, durationSec * 1000);
}

export function reveal(
  io: Server,
  RoomManager: RoomManager,
  roomId: string,
  reason: RevealReason,
  answeredBy?: AnsweredBy
) {
  const room = RoomManager.get(roomId);
  if (!room) return;
  if (room.status !== 'playing') return;
  if (room.runtime.phase !== 'round') return;

  const song = room.songList[room.currentSongIndex];
  if (!song) return;

  if (room.runtime.revealed) return;
  room.runtime.revealed = true;

  clearTimer(room.runtime.hintTimeoutId);
  room.runtime.hintTimeoutId = undefined;

  const answerText = `${song.singer} - ${song.title}`;

  if (reason === 'correct' && answeredBy) {
    sendSystemChat(io, roomId, {
      color: answeredBy.color,
      systemType: 'correct',
      message: `${answeredBy.nickname} (${answeredBy.score}점) | 정답: ${answerText}`,
    });
  } else if (reason === 'skip') {
    sendSystemChat(io, roomId, {
      systemType: 'skip',
      message: `다음 곡으로 넘어갑니다.`,
    });
  } else if (reason === 'timeout') {
    sendSystemChat(io, roomId, {
      systemType: 'timeout',
      message: `정답: ${answerText}`,
    });
  }

  io.to(roomId).emit('game:reveal', {
    currentSongIndex: room.currentSongIndex,
    reason,
    answer: {
      singer: song.singer,
      title: song.title,
      extraAnswers: song.extraAnswers,
    },
    answeredBy,
  });
}

/**
 * ✅ skip 과반 처리
 * 정책:
 * - 현재 인원 기준으로 required를 매번 계산
 * - skipVotes는 정리하지 않음(퇴장자 표도 유효)
 */
export function handleSkipMajority(io: Server, RoomManager: RoomManager, roomId: string) {
  const room = RoomManager.get(roomId);
  if (!room) return;
  if (room.status !== 'playing') return;
  if (room.runtime.phase !== 'round') return;

  // ✅ 이미 reveal 됐으면 중복 처리 방지
  if (!room.runtime.revealed) {
    reveal(io, RoomManager, roomId, 'skip', undefined);
  }

  clearTimer(room.runtime.endTimeoutId);
  room.runtime.endTimeoutId = undefined;

  scheduleNextRound(io, RoomManager, roomId);
}

export function scheduleNextRound(io: Server, RoomManager: RoomManager, roomId: string) {
  const room = RoomManager.get(roomId);
  if (!room) return;
  if (room.status !== 'playing') return;

  const nextIndex = room.currentSongIndex + 1;

  // game:finished
  if (nextIndex >= room.songList.length) {
    // 초기화
    room.status = 'waiting';
    room.currentSongIndex = 0;
    room.runtime.phase = 'countdown';
    room.runtime.startsAtMs = undefined;
    room.runtime.roundStartedAtMs = undefined;
    room.runtime.durationSec = undefined;
    room.runtime.revealed = false;
    room.runtime.hintShown = false;
    room.runtime.skipVotes = new Set();
    clearAllTimers(room);
    bumpNonce(room);

    io.to(roomId).emit('game:finished');

    sendSummaryChat(io, roomId, {
      players: Array.from(room.players.values())
        .map((p) => ({
          nickname: p.nickname,
          color: p.color,
          score: p.score,
          lastCorrectAtMs: p.lastCorrectAtMs,
        }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score; // 점수 높은 순
          // 0점이면 그대로
          if (a.score === 0) return 0;
          // 1점 이상 동점이면 먼저 정답을 맞춘 사람이 위
          if (a.lastCorrectAtMs && b.lastCorrectAtMs) return a.lastCorrectAtMs - b.lastCorrectAtMs;
          if (a.lastCorrectAtMs) return -1;
          if (b.lastCorrectAtMs) return 1;
          return 0; // 둘 다 없으면 그대로
        })
        .map(({ lastCorrectAtMs, ...rest }) => rest),
    });

    // 점수 초기화
    for (const p of room.players.values()) {
      p.score = 0;
      p.lastCorrectAtMs = null;
      // p.ready = false;
    }

    RoomManager.emitRoomUpdate(io, roomId);
    RoomManager.emitRoomList(io);

    return;
  }

  scheduleRoundStart(io, RoomManager, roomId, nextIndex);
}
