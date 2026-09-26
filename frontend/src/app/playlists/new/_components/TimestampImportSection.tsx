'use client';

import { useId, useMemo, useState } from 'react';
import clsx from 'clsx';
import { toast } from '@/lib/store/useToastStore';
import { extractVideoId } from '@/utils/youtube';
import {
  parseTimestamps,
  SEPARATORS,
  type ParseOptions,
  type SeparatorKey,
} from '@/app/playlists/new/_utils/parseTimestamps';
import { formatSeconds } from '@/utils/time';

import Button from '@/components/button/Button';
import InputField from '@/components/form/input/InputField';
import FormField from '@/components/form/element/FormField';
import BaseInput from '@/components/form/input/BaseInput';
import Checkbox from '@/components/form/checkbox/Checkbox';
import SegmentedControl from '@/components/segment/SegmentedControl';

import type { SongInfo } from '@/services/songs/types';

interface Props {
  /** 곡들을 목록에 담고, 실제로 담긴 수를 돌려준다. 이미 목록에 있는 곡은 건너뛴다 */
  onAdd: (songs: SongInfo[]) => number;
}

type TrackEdit = { singer: string; title: string };

type SeparatorChoice = 'auto' | SeparatorKey | 'custom';

const SEPARATOR_KEYS = Object.keys(SEPARATORS) as SeparatorKey[];

/**
 * 영상 하나 + 타임스탬프 목록을 붙여넣어 여러 곡을 한 번에 만든다.
 *
 * 유튜브 설명란·댓글·남이 정리한 메모 어디서 가져와도 된다.
 * 파싱이 완벽할 수 없으므로 추가 전에 확인·수정하는 단계를 둔다.
 */
export default function TimestampImportSection({ onAdd }: Props) {
  const textId = useId();
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [isTextFocus, setIsTextFocus] = useState(false);
  /**
   * 사용자가 고친 가수·제목. 원문 줄을 키로 쓴다.
   * - 줄 순서로 잡으면 중간에 줄을 넣거나 지웠을 때 고친 값이 다른 곡으로 밀린다.
   * - 시작 시점으로 잡으면 목록을 통째로 바꿔도 같은 시점(특히 0:00)에 이전 목록의 값이 붙는다.
   * 원문 줄에 묶으면 그 줄이 그대로 있는 동안만 적용되고, 조정 도구를 바꿔도 유지된다.
   */
  const [edited, setEdited] = useState<Record<string, TrackEdit>>({});

  /**
   * 목록 전체에 한 번에 적용하는 조정. 자동 추측이 틀렸을 때
   * 수십 곡을 한 줄씩 고치지 않아도 되게 한다. 직접 고친 줄은 고친 값이 우선이다.
   */
  const [separatorChoice, setSeparatorChoice] = useState<SeparatorChoice>('auto');
  const [customSeparator, setCustomSeparator] = useState('');
  const [swap, setSwap] = useState(false);
  const [cleanTitle, setCleanTitle] = useState(true);

  const { tracks: parsed, detected } = useMemo(() => {
    const separator: ParseOptions['separator'] =
      separatorChoice === 'auto'
        ? undefined
        : separatorChoice === 'custom'
          ? // 아직 비어 있으면 자동으로 둔다
            customSeparator
            ? { custom: customSeparator }
            : undefined
          : separatorChoice;

    return parseTimestamps(text, { separator, swap, cleanTitle });
  }, [text, separatorChoice, customSeparator, swap, cleanTitle]);

  const separatorOptions = [
    { value: 'auto' as const, label: detected ? `자동 (${SEPARATORS[detected].label})` : '자동' },
    ...SEPARATOR_KEYS.map((key) => ({ value: key, label: SEPARATORS[key].label })),
    { value: 'custom' as const, label: '직접' },
  ];

  const trackOf = (i: number): TrackEdit => {
    const t = parsed[i];
    return edited[t.raw] ?? { singer: t.singer, title: t.title };
  };

  const editTrack = (i: number, patch: Partial<TrackEdit>) => {
    const key = parsed[i].raw;
    setEdited((prev) => ({ ...prev, [key]: { ...trackOf(i), ...patch } }));
  };

  const reset = () => {
    setUrl('');
    setText('');
    setEdited({});
    // 다음 목록은 형식이 다를 수 있어 조정도 처음으로 돌린다
    setSeparatorChoice('auto');
    setCustomSeparator('');
    setSwap(false);
    setCleanTitle(true);
  };

  const handleAdd = () => {
    if (!extractVideoId(url)) return toast.error('유효한 유튜브 링크를 입력해 주세요.');
    if (parsed.length === 0) return toast.error('타임스탬프를 찾지 못했습니다.');

    const tracks = parsed.map((_, i) => trackOf(i));
    if (tracks.some((t) => !t.title.trim())) return toast.error('제목이 비어 있는 곡이 있습니다.');

    const added = onAdd(
      parsed.map((t, i) => ({
        url: url.trim(),
        singer: tracks[i].singer.trim(),
        title: tracks[i].title.trim(),
        startSeconds: t.startSeconds,
        endSeconds: t.endSeconds,
        extraAnswers: [],
      }))
    );

    // 하나도 안 담겼으면 입력을 남긴다 — 지우면 목록은 그대로인데 붙여넣은 내용만 사라진다
    if (added === 0) return toast.info('모두 이미 목록에 있는 곡입니다.');

    const skipped = parsed.length - added;
    toast.success(
      skipped > 0
        ? `${added}곡을 담았습니다. ${skipped}곡은 이미 목록에 있어 건너뛰었습니다.`
        : `${added}곡을 목록에 담았습니다.`
    );
    reset();
  };

  return (
    <>
      <InputField
        label='유튜브 링크'
        required
        value={url}
        onChange={setUrl}
        placeholder='https://www.youtube.com/watch?v=...'
        helperText='곡이 여러 개 담긴 영상 하나의 주소입니다.'
      />

      <FormField
        id={textId}
        label='타임스탬프 목록'
        required
        focused={isTextFocus}
        helperText={
          '영상 설명란이나 댓글에서 그대로 복사해 붙여넣으세요. \n번호·대괄호나 00:00 - 03:42 같은 구간 표기가 섞여 있어도 됩니다.'
        }
        grow
      >
        <textarea
          id={textId}
          className='scrollbar-custom h-40 w-full resize-y p-2 text-base outline-none placeholder:text-gray-500'
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsTextFocus(true)}
          onBlur={() => setIsTextFocus(false)}
          placeholder={'00:00 아이유 - 좋은 날\n03:42 BTS - DNA\n07:15 뉴진스 - Ditto'}
        />
      </FormField>

      {text.trim() && parsed.length === 0 && (
        <p className='text-sm text-red-400'>타임스탬프를 찾지 못했습니다. 형식을 확인해 주세요.</p>
      )}

      {parsed.length > 0 && (
        <div className='flex flex-col gap-2'>
          <p className='text-sm text-gray-300'>
            <span className='font-bold text-green-400'>{parsed.length}곡</span>을 찾았습니다. 가수·제목이 맞는지 확인해
            주세요.
          </p>

          <div className='flex flex-col gap-3 rounded border border-gray-700 bg-gray-900/40 p-3 text-sm'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-gray-300'>가수·제목 구분</span>
              <SegmentedControl
                className='w-fit'
                ariaLabel='가수와 제목 사이 구분자'
                options={separatorOptions}
                value={separatorChoice}
                onChange={setSeparatorChoice}
              />
              {separatorChoice === 'custom' && (
                <InputField
                  className='w-28'
                  size='sm'
                  value={customSeparator}
                  onChange={setCustomSeparator}
                  placeholder='예: ~'
                  aria-label='직접 입력한 구분자'
                />
              )}
            </div>

            <div className='flex flex-wrap gap-x-5 gap-y-2'>
              <Checkbox size='sm' label='가수·제목 순서 바꾸기' checked={swap} onChange={setSwap} />
              <Checkbox
                size='sm'
                label='제목에서 Feat·Prod·MV 표기 빼기'
                checked={cleanTitle}
                onChange={setCleanTitle}
              />
            </div>
          </div>

          {/*
            표 대신 한 줄짜리 목록으로 보여준다. 바로 아래 노래 목록도 표라서
            같은 모양이 두 번 쌓이면 어느 쪽이 확정된 목록인지 헷갈린다.
            입력칸은 평소엔 글자처럼 보이다가 마우스를 올리거나 누르면 테두리가 생긴다.
          */}
          <ol className='scrollbar-custom max-h-72 divide-y divide-gray-800 overflow-auto rounded border border-gray-700'>
            {parsed.map((t, i) => {
              const track = trackOf(i);
              const missingTitle = !track.title.trim();

              return (
                <li key={t.startSeconds} className='flex items-center gap-2 px-2 py-1 text-sm' title={`원문: ${t.raw}`}>
                  <span className='w-16 shrink-0 font-mono text-gray-500'>{formatSeconds(t.startSeconds)}</span>

                  <BaseInput
                    className='focus:border-green w-[35%] min-w-0 rounded border border-transparent px-1.5 py-1 hover:border-gray-600'
                    value={track.singer}
                    onChange={(v) => editTrack(i, { singer: v })}
                    placeholder='가수 (선택)'
                    aria-label={`${formatSeconds(t.startSeconds)} 가수`}
                  />

                  <span className='text-gray-600'>-</span>

                  <BaseInput
                    className={clsx(
                      'focus:border-green min-w-0 flex-1 rounded border px-1.5 py-1',
                      missingTitle ? 'border-red' : 'border-transparent hover:border-gray-600'
                    )}
                    value={track.title}
                    onChange={(v) => editTrack(i, { title: v })}
                    placeholder='제목 (필수)'
                    aria-label={`${formatSeconds(t.startSeconds)} 제목`}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Button color='gray' onClick={reset} disabled={!url && !text}>
          지우기
        </Button>
        <Button color='green' onClick={handleAdd} disabled={parsed.length === 0}>
          {parsed.length > 0 ? `${parsed.length}곡 추가` : '추가'}
        </Button>
      </div>
    </>
  );
}
