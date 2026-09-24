'use client';

import { useState, type RefObject } from 'react';
import { useInterval } from '@/hooks/useInterval';
import { toast } from '@/lib/store/useToastStore';
import { formatSeconds } from '@/app/playlists/new/_utils/time';
import Button from '@/components/button/Button';

/** 표시가 밀려 보이지 않을 만큼 촘촘하되, 불필요하게 잦지 않은 값 */
const POLL_INTERVAL_MS = 250;

interface Props {
  playerRef: RefObject<YT.Player | null>;
  /** 재생 중일 때만 위치를 따라간다 */
  active: boolean;
  /** 없으면 위치만 보여주고 "여기서 시작" 버튼은 숨긴다 (검색 모달처럼 시작점을 정할 필요가 없는 곳) */
  onPick?: (seconds: number) => void;
}

/**
 * 재생 위치를 보여주고, 그 지점을 시작 시간으로 집어주는 컨트롤.
 * 초를 직접 계산해 입력하지 않아도 되게 하는 것이 목적이다.
 */
export default function StartPicker({ playerRef, active, onPick }: Props) {
  const [playedSeconds, setPlayedSeconds] = useState(0);

  // 표시는 초 단위지만 1초 간격으로 읽으면 폴링 시점이 영상의 초 경계와 어긋나
  // 표시가 최대 1초까지 밀린다. 더 촘촘히 읽되, 저장은 정수로 내림해서
  // 같은 초 동안에는 상태가 그대로라 리렌더가 일어나지 않게 한다.
  useInterval(() => {
    const t = playerRef.current?.getCurrentTime?.();
    if (typeof t === 'number' && Number.isFinite(t)) setPlayedSeconds(Math.floor(t));
  }, active ? POLL_INTERVAL_MS : null);

  const pick = () => {
    const t = playerRef.current?.getCurrentTime?.();
    if (typeof t !== 'number' || !Number.isFinite(t)) {
      return toast.error('재생 위치를 읽을 수 없습니다.');
    }

    const seconds = Math.max(0, Math.floor(t));
    onPick?.(seconds);
    toast.success(`시작 시간을 ${formatSeconds(seconds)} (${seconds}초)로 맞췄습니다.`);
  };

  return (
    <div className='flex items-center gap-3'>
      {onPick && (
        <Button className='shrink-0 px-4' color='gray' onClick={pick}>
          여기서 시작
        </Button>
      )}

      <span className='text-sm text-gray-400'>
        재생 위치 <span className='font-mono text-gray-200'>{formatSeconds(playedSeconds)}</span>
        {onPick && <span className='ml-2 text-xs text-gray-500'>원하는 시작 지점에서 누르세요</span>}
      </span>
    </div>
  );
}
