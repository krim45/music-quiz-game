'use client';

import { useState } from 'react';
import { toast } from '@/lib/store/useToastStore';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { validatePreview, validateSongInfo } from '@/app/playlists/new/_utils/validateSongInfo';
import { EMPTY_SONG_FORM, toSongInfo } from '@/app/playlists/new/_utils/songForm';
import StartPicker from '@/app/playlists/new/_components/StartPicker';
import { formatSeconds } from '@/app/playlists/new/_utils/time';
import ExtraAnswersInput from '@/app/playlists/new/_components/ExtraAnswersInput';

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

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
      try {
        playerRef.current?.stopVideo?.();
      } catch {
        // 이미 정리된 플레이어면 무시
      }
      return;
    }

    const result = validatePreview(toSongInfo(form));
    if (!result.ok) return toast.error(result.error);

    const start = Number(result.startSeconds) || 0;
    setShowPreview(true);
    playerRef.current?.loadVideoById({ videoId: result.videoId, startSeconds: start, endSeconds: start + 60 });
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
            helperText={form.startSeconds ? `${formatSeconds(Number(form.startSeconds) || 0)} 지점` : ' '}
          />

          {/* 라벨 높이만큼 내려 입력란과 같은 줄에 맞춘다 */}
          <Button
            className='mt-[23px] w-[25%] min-w-0 shrink-0 self-start truncate'
            color='gray'
            onClick={togglePreview}
          >
            {showPreview ? '미리보기 닫기' : '미리보기'}
          </Button>
        </div>

        <div className={`my-3 aspect-video w-full ${showPreview ? 'h-auto' : 'h-0 overflow-hidden'}`}>
          <div id='preview' />
        </div>

        {showPreview && (
          <div className='mb-3'>
            <StartPicker
              playerRef={playerRef}
              active={showPreview}
              onPick={(seconds) => updateField('startSeconds', String(seconds))}
            />
          </div>
        )}

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
        <ExtraAnswersInput
          className='min-w-0 flex-1'
          label='추가 정답'
          value={form.extraAnswers}
          onChange={(next) => updateField('extraAnswers', next)}
          title={form.title}
          placeholder='Good Day 입력 후 Enter'
          helperText={'엔터로 하나씩 추가합니다. \nGood Day만 넣어도 goodday, GOOD DAY 모두 정답으로 인정됩니다.'}
        />

        <Button className='mt-[23px] w-[25%] truncate' color='green' onClick={handleAddSong}>
          노래 추가
        </Button>
      </div>
    </>
  );
}
