import type { SongFormState, SongInfo, SongPayload } from '@/services/songs/types';

export const EMPTY_SONG_FORM: SongFormState = {
  url: '',
  startSeconds: '',
  singer: '',
  title: '',
  extraAnswers: [],
};

/** 입력 폼 -> 목록에 담을 편집 모델 */
export function toSongInfo(form: SongFormState): SongInfo {
  const start = form.startSeconds.trim();

  return {
    url: form.url.trim(),
    singer: form.singer.trim(),
    title: form.title.trim(),
    startSeconds: start === '' ? undefined : Number(start),
    extraAnswers: form.extraAnswers,
  };
}

/** 편집 모델 -> 서버 전송 형태 */
export function toSongPayload(song: SongInfo): SongPayload {
  return {
    songId: song.songId,
    url: song.url,
    singer: song.singer,
    title: song.title,
    startSeconds: song.startSeconds,
    endSeconds: song.endSeconds ?? null,
    extraAnswers: song.extraAnswers,
  };
}
