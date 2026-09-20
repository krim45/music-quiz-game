/** 게임 진행 관련 소켓 계약. */

import type { RoundSong } from './room';

export type SkipState = {
  current: number;
  required: number;
};

/** 라운드가 끝난 이유 */
export type RevealReason = 'correct' | 'skip' | 'timeout';

/**
 * `game:start` — 매 라운드 재생 전 카운트다운 시작.
 * 실제 재생 시작은 `game:play`가 따로 알린다.
 */
export type GameStart = {
  currentSongIndex: number;
  /** 서버 기준 실제 재생이 시작될 시각 (epoch ms) */
  startsAtMs: number;
  /** 카운트다운 길이 */
  delayMs: number;
  /** 이번 라운드 재생 길이 (초) */
  durationSec: number;
  song: RoundSong;
  skip: SkipState;
};

/** `game:play` — 실제 재생 시작 */
export type GamePlay = {
  currentSongIndex: number;
  roundStartedAtMs: number;
  durationSec: number;
  song: RoundSong;
  skip: SkipState;
};

/** `game:skip:update` — 스킵 투표 현황 변동 */
export type GameSkipUpdate = {
  currentSongIndex: number;
  skip: SkipState;
};

/** `game:hint` — 라운드 중간에 가수명 공개 */
export type GameHint = {
  currentSongIndex: number;
  singer: string;
};

/** `game:reveal` — 라운드 종료 및 정답 공개 */
export type GameReveal = {
  currentSongIndex: number;
  reason: RevealReason;
  answer: {
    singer: string;
    title: string;
    extraAnswers?: string | null;
  };
  /** 정답자. reason이 'correct'일 때만 존재한다. */
  answeredBy?: {
    nickname: string;
    color: string;
  };
};

/** `game:finished` — 페이로드 없음 */
