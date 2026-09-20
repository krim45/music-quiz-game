import type { SongFormState, SongInfo, SongPayload } from '@/services/songs/types';

export const EMPTY_SONG_FORM: SongFormState = {
  url: '',
  startSeconds: '',
  singer: '',
  title: '',
  extraAnswers: '',
};

/**
 * 정답 비교 기준. 백엔드의 normalizeAnswer(backend/src/utils/room.ts)와 같아야 한다.
 * 공백과 대소문자는 무시되므로, 그 차이만 있는 추가 정답은 넣어봐야 의미가 없다.
 */
export function normalizeAnswer(input: string) {
  return input.replace(/\s+/g, '').trim().toLowerCase();
}

/**
 * 쉼표로 입력받은 추가 정답을 배열로 바꾼다.
 * 제목과 사실상 같은 값(공백·대소문자 차이뿐인 것)과 중복은 걸러낸다.
 */
export function parseExtraAnswers(raw: string, title: string): string[] {
  const titleKey = normalizeAnswer(title);
  const seen = new Set<string>([titleKey]);
  const out: string[] = [];

  for (const item of raw.split(',')) {
    const value = item.trim();
    if (!value) continue;

    const key = normalizeAnswer(value);
    if (seen.has(key)) continue; // 제목과 같거나 이미 넣은 값

    seen.add(key);
    out.push(value);
  }

  return out;
}

/** 입력 폼 -> 목록에 담을 편집 모델 */
export function toSongInfo(form: SongFormState): SongInfo {
  const start = form.startSeconds.trim();

  return {
    url: form.url.trim(),
    singer: form.singer.trim(),
    title: form.title.trim(),
    startSeconds: start === '' ? undefined : Number(start),
    extraAnswers: form.extraAnswers.trim(),
  };
}

/** 편집 모델 -> 서버 전송 형태. 여기서만 배열로 바꾼다. */
export function toSongPayload(song: SongInfo): SongPayload {
  return {
    songId: song.songId,
    url: song.url,
    singer: song.singer,
    title: song.title,
    startSeconds: song.startSeconds,
    endSeconds: song.endSeconds ?? null,
    extraAnswers: parseExtraAnswers(song.extraAnswers, song.title),
  };
}
