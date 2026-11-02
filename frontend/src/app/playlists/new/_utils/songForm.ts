import type { SongFormState, SongInfo, SongPayload } from '@/services/songs/types';

export const EMPTY_SONG_FORM: SongFormState = {
  url: '',
  startSeconds: undefined,
  singer: '',
  title: '',
  extraAnswers: [],
};

/** 입력 폼 -> 목록에 담을 편집 모델 */
export function toSongInfo(form: SongFormState): SongInfo {
  return {
    url: form.url.trim(),
    singer: form.singer.trim(),
    title: form.title.trim(),
    startSeconds: form.startSeconds,
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
    // null(형식 오류)은 제출 전에 막으므로 여기까지 오지 않는다
    startSeconds: song.startSeconds ?? undefined,
    endSeconds: song.endSeconds ?? null,
    extraAnswers: song.extraAnswers,
  };
}
