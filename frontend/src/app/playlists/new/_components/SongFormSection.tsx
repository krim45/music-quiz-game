'use client';

import { useState } from 'react';
import { toast } from '@/lib/store/useToastStore';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { validatePreview, validateSongInfo } from '@/app/playlists/new/_utils/validateSongInfo';
import { EMPTY_SONG_FORM, toSongInfo } from '@/app/playlists/new/_utils/songForm';

import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';

import type { SongFormState, SongInfo } from '@/services/songs/types';

interface Props {
  onAddSong: (song: SongInfo) => void;
}

export default function SongFormSection({ onAddSong }: Props) {
  const [form, setForm] = useState<SongFormState>(EMPTY_SONG_FORM);
  const [showPreview, setShowPreview] = useState(false);

  const { playerRef } = useYouTubePlayer('preview', { width: '100%', height: '100%' });

  const updateField = <K extends keyof SongFormState>(key: K, value: SongFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLoadPreview = () => {
    const songInfo = toSongInfo(form);
    const result = validatePreview(songInfo);
    if (!result.ok) return toast.error(result.error);

    setShowPreview(true);
    playerRef.current?.loadVideoById({
      videoId: result.videoId,
      startSeconds: Number(result.startSeconds) || 0,
      endSeconds: (Number(result.startSeconds) || 0) + 60,
    });
  };

  const handleAddSong = () => {
    const songInfo = toSongInfo(form);
    const error = validateSongInfo(songInfo);
    if (error) return toast.error(error);

    onAddSong(songInfo);
    setForm(EMPTY_SONG_FORM);
    setShowPreview(false);
    playerRef.current?.stopVideo?.();
    toast.info('노래가 추가되었습니다!');
  };

  return (
    <>
      <div>
        <div className='flex gap-3'>
          <InputField
            className='w-[40%] min-w-0'
            required
            label='유튜브 링크'
            value={form.url}
            onChange={(v) => updateField('url', v)}
            placeholder='https://www.youtube.com/watch?v=9KbsCZUTRbg'
          />

          <InputField
            className='min-w-0 flex-1'
            label='시작 시간'
            type='number'
            value={form.startSeconds}
            onChange={(v) => updateField('startSeconds', v)}
            placeholder='90(초)'
          />

          <Button className='w-[25%] min-w-0 self-end truncate' color='gray' onClick={handleLoadPreview}>
            미리보기
          </Button>
        </div>

        <div className={`my-3 aspect-video w-full ${showPreview ? 'h-auto' : 'h-0 overflow-hidden'}`}>
          <div id='preview' />
        </div>

        <div className='flex gap-3'>
          <InputField
            className='w-[40%] min-w-0'
            required
            label='가수'
            value={form.singer}
            onChange={(v) => updateField('singer', v)}
            placeholder='아이유(IU)'
          />

          <InputField
            className='min-w-0 flex-1'
            required
            label='노래 제목'
            value={form.title}
            onChange={(v) => updateField('title', v)}
            placeholder='좋은 날'
          />
        </div>
      </div>

      <div className='flex gap-3'>
        <InputField
          className='min-w-0 flex-1'
          label='추가 정답'
          value={form.extraAnswers}
          onChange={(v) => updateField('extraAnswers', v)}
          placeholder='Good Day, 굿 데이'
          helperText={'정답으로 인정할 표현을 입력해 주세요. \n복수 정답 가능, 쉼표로 구분해 주세요.'}
        />

        <Button className='mt-[23px] w-[25%] truncate' color='green' onClick={handleAddSong}>
          노래 추가
        </Button>
      </div>
    </>
  );
}
