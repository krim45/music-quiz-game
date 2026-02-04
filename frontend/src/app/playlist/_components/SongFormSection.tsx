'use client';

import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';

import type { SongInfo } from '@/app/services/songs/types';

interface Props {
  songInfo: SongInfo;
  showPreview: boolean;
  onChange: (key: keyof SongInfo, value: SongInfo[keyof SongInfo]) => void;
  onLoadPreview: () => void;
  onAddSong: () => void;
}

export default function SongFormSection({ songInfo, showPreview, onChange, onLoadPreview, onAddSong }: Props) {
  return (
    <>
      <div>
        <div className='flex gap-3'>
          <InputField
            className='w-[40%] min-w-0'
            required
            label='유튜브 링크'
            value={songInfo.url}
            onChange={(v) => onChange('url', v)}
            placeholder='https://www.youtube.com/watch?v=9KbsCZUTRbg'
          />

          <InputField
            className='min-w-0 flex-1'
            label='시작 시간'
            type='number'
            value={String(songInfo.startSeconds)}
            onChange={(v) => onChange('startSeconds', Number(v))}
            placeholder='90(초)'
          />

          <Button className='w-[25%] min-w-0 self-end truncate' color='gray' onClick={onLoadPreview}>
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
            value={songInfo.singer}
            onChange={(v) => onChange('singer', v)}
            placeholder='아이유(IU)'
          />

          <InputField
            className='min-w-0 flex-1'
            required
            label='노래 제목'
            value={songInfo.title}
            onChange={(v) => onChange('title', v)}
            placeholder='좋은 날'
          />
        </div>
      </div>

      <div className='flex gap-3'>
        <InputField
          className='min-w-0 flex-1'
          label='추가 정답'
          value={songInfo.extraAnswers}
          onChange={(v) => onChange('extraAnswers', v)}
          placeholder='Good Day, 굿 데이'
          helperText={'정답으로 인정할 표현을 입력해 주세요. \n복수 정답 가능, 쉼표로 구분해 주세요.'}
        />

        <Button className='mt-[23px] w-[25%] truncate' color='green' onClick={onAddSong}>
          노래 추가
        </Button>
      </div>
    </>
  );
}
