import type { SongFormState, SongInfo } from '@/services/songs/types';

export const EMPTY_SONG_FORM: SongFormState = {
  url: '',
  startSeconds: '',
  singer: '',
  title: '',
  extraAnswers: '',
};

export function toSongInfo(form: SongFormState): SongInfo {
  const start = form.startSeconds.trim();
  const extraAnswers = form.extraAnswers.trim();

  return {
    url: form.url.trim(),
    singer: form.singer.trim(),
    title: form.title.trim(),
    startSeconds: start === '' ? undefined : Number(start),
    extraAnswers: extraAnswers === '' ? undefined : extraAnswers,
  };
}
