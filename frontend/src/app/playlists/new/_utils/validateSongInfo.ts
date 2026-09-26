import { extractVideoId } from '@/utils/youtube';
import type { SongInfo } from '@/services/songs/types';

const SONG_ERRORS = {
  INVALID_LINK: '유효한 유튜브 링크를 입력해 주세요.',
  INVALID_START: '시작 시간을 올바르게 입력해 주세요.',
  EMPTY_SINGER: '가수는 반드시 입력해야 합니다.',
  EMPTY_TITLE: '노래 제목은 반드시 입력해야 합니다.',
} as const;

export function validateSongInfo(song: SongInfo): string | null {
  const videoId = extractVideoId(song.url);
  if (!videoId) return SONG_ERRORS.INVALID_LINK;

  // null은 입력칸에 시간 형식이 아닌 값이 남아 있는 상태다. 이전 값으로 추가되지 않게 막는다
  const startSeconds = song.startSeconds === null ? NaN : Number(song.startSeconds ?? 0);
  if (isNaN(startSeconds) || startSeconds < 0) {
    return SONG_ERRORS.INVALID_START;
  }

  if (!song.singer.trim()) {
    return SONG_ERRORS.EMPTY_SINGER;
  }

  if (!song.title.trim()) {
    return SONG_ERRORS.EMPTY_TITLE;
  }

  return null;
}

export function validatePreview(
  song: SongInfo
): { ok: false; error: string } | { ok: true; videoId: string; startSeconds: number } {
  const videoId = extractVideoId(song.url);
  if (!videoId) return { ok: false, error: SONG_ERRORS.INVALID_LINK };

  // 시작 시간을 비워두면 0초부터 듣는다.
  // 미리듣기는 "시작점을 찾으려고" 누르는 것이므로, 값이 없다고 막으면 안 된다.
  const start = song.startSeconds === null ? NaN : Number(song.startSeconds ?? 0);
  if (isNaN(start) || start < 0) {
    return { ok: false, error: SONG_ERRORS.INVALID_START };
  }

  return { ok: true, videoId, startSeconds: start };
}
