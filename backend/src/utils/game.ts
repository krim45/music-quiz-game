import type { Server, Socket } from 'socket.io';
import { RoomManager } from '@/sockets/RoomManager';
import type { PlaylistItem, Room } from '@/types';

const DEFAULT_DURATION_SEC = 60;
const ROUND_START_DELAY_MS = 4000;

type RevealReason = 'correct' | 'timeout' | 'skip';
type AnsweredBy = { playerId: string; nickname: string; color: string };

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

function chat(io: Server, roomId: string, message: string) {
  io.to(roomId).emit('chat:message', {
    from: 'SYSTEM',
    color: '#9CA3AF', // 회색(프론트가 style 그대로 쓰면)
    message,
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

  // ✅ 라운드마다 스킵 투표는 초기화 (다음 라운드로 carry 없음)
  room.runtime.skipVotes = new Set();

  const durationSec = computeDurationSec(song);
  const startsAtMs = Date.now() + ROUND_START_DELAY_MS;

  room.runtime.startsAtMs = startsAtMs;
  room.runtime.durationSec = durationSec;

  // ✅ required는 "지금 인원" 기준으로 계산해서 UI에 내려줌
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

  // ✅ 라운드 진입 시에도 초기화(중복이어도 안전)
  room.runtime.skipVotes = new Set();

  RoomManager.emitRoomUpdate(io, roomId);

  // ✅ play 시점의 required도 "현재 인원" 기준으로
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

  // ✅ (추가) 채팅으로 정답/정답자 공지
  const answerText = `${song.singer} - ${song.title}`;

  if (reason === 'correct' && answeredBy) {
    chat(io, roomId, `정답: ${answerText} | ${answeredBy.nickname} (+1점)`);
  } else if (reason === 'skip') {
    chat(io, roomId, `스킵! 정답: ${answerText}`);
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

  if (nextIndex >= room.songList.length) {
    // 1) 상태 전환
    room.status = 'waiting';

    // 2) 타이머 정리
    clearAllTimers(room);

    // 3) 인덱스/런타임 초기화 (✅ 처음 Waiting 상태로)
    room.currentSongIndex = 0;

    room.runtime.phase = 'countdown'; // 또는 'round'가 아닌 별도 'idle'을 쓰면 더 좋음
    room.runtime.startsAtMs = undefined;
    room.runtime.roundStartedAtMs = undefined;
    room.runtime.durationSec = undefined;
    room.runtime.revealed = false;
    room.runtime.hintShown = false;
    room.runtime.skipVotes = new Set();
    // roundNonce는 유지해도 되고, 올려도 됨 (안전하게 올리려면 bumpNonce(room) 호출)
    bumpNonce(room);

    // 5) 결과 이벤트
    io.to(roomId).emit('game:finished', {
      players: Array.from(room.players.values()).map((p) => ({
        nickname: p.nickname,
        color: p.color,
        score: p.score,
        // ready: p.ready,
        isOwner: p.isOwner,
      })),
    });

    // 점수 초기화
    for (const p of room.players.values()) {
      p.score = 0;
      // p.ready = false;
    }

    RoomManager.emitRoomUpdate(io, roomId);
    RoomManager.emitRoomList(io);

    return;
  }

  scheduleRoundStart(io, RoomManager, roomId, nextIndex);
}
