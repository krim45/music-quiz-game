'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import Button from '@/components/button/Button';

import type { RoomInfo, RoomRuntime, GameStart, GamePlay, GameHint, GameReveal } from '@/types/game';

type Props = {
  roomId: string;
  runtime: RoomRuntime;
  roomInfo: RoomInfo;
  startState: GameStart | null;
  playState: GamePlay | null;
  hint: GameHint | null;
  reveal: GameReveal | null;
};

export default function PlayingSection({ roomId, runtime, roomInfo, startState, playState, hint, reveal }: Props) {
  const [remainSec, setRemainSec] = useState<number>(0);
  const [countdownSec, setCountdownSec] = useState<number>(0);

  const sortedPlayers = useMemo(() => {
    return [...runtime.players].sort((a, b) => b.score - a.score);
  }, [runtime.players]);

  // 실제 라운드 타이머(초)
  useEffect(() => {
    if (!playState) {
      setRemainSec(0);
      return;
    }

    const { roundStartedAtMs, durationSec } = playState;

    const tick = () => {
      const elapsedSec = (Date.now() - roundStartedAtMs) / 1000;
      const remain = durationSec - elapsedSec;
      setRemainSec(Math.max(0, Math.floor(remain)));
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [playState]);

  // 매 라운드 시작 전 카운트다운(초)
  useEffect(() => {
    if (!startState?.startsAtMs) {
      setCountdownSec(0);
      return;
    }

    const tick = () => {
      const ms = startState.startsAtMs - Date.now();
      setCountdownSec(Math.max(0, Math.ceil(ms / 1000)));
    };

    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [startState]);

  const skip = playState?.skip ?? startState?.skip;

  const onSkip = () => {
    const socket = getSocket();

    socket.emit(
      'game:skip',
      { roomId, currentSongIndex: playState?.currentSongIndex },
      (res: { ok: boolean; message?: string }) => {
        if (!res.ok) {
          toast.error(res.message || '스킵 실패');
          return;
        }
      }
    );
  };

  const isCountingDown = countdownSec > 0;

  return (
    <>
      <div className='scrollbar-custom flex flex-1 flex-col items-center justify-center gap-2 overflow-auto rounded border border-green-900 p-3'>
        <div className='text-blue-300'>
          남은곡 ({runtime.currentSongIndex + 1} / {roomInfo.room.songCount})
        </div>

        <div>
          노래를 듣고 <span className='text-orange'>답</span>을 입력하세요.
        </div>

        {/* ✅ 카운트다운 UI */}
        {isCountingDown && <div className='text-blue-700'>{countdownSec > 1 ? countdownSec - 1 : 'Start'}</div>}

        {/* ✅ 라운드 타이머 (초단위) */}
        {remainSec > 0 && <div className='text-green-700'>- {remainSec}초 -</div>}

        {!!skip && (
          <div className='text-xs'>
            스킵 {skip.current} / {skip.required}
          </div>
        )}

        {/* ✅ 힌트 UI */}
        {hint && !reveal && (
          <div className='w-full rounded text-center text-sm text-blue-500'>
            <div>
              가수: <span className='font-medium'>{hint.singer}</span>
            </div>
          </div>
        )}

        {/* ✅ 정답 공개 UI */}
        {reveal && (
          <div className='mt-3 w-full rounded bg-orange-50 px-3 py-2 text-center text-sm'>
            <div className='mt-1'>
              {reveal.answer.singer} - {reveal.answer.title}
            </div>

            {reveal.reason === 'correct' && reveal.answeredBy?.nickname && (
              <div className='mt-2 flex items-center justify-center gap-2 text-xs'>
                <span>정답자:</span>
                <span
                  className='inline-block h-3 w-3 rounded-sm'
                  style={{ backgroundColor: reveal.answeredBy.color }}
                />
                <span className='font-medium'>{reveal.answeredBy.nickname}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='flex min-w-40 flex-col gap-2 rounded border border-green-900 p-3'>
        <div className='flex items-center justify-between'>플레이어</div>

        <ul className='scrollbar-custom flex-1 overflow-auto'>
          {sortedPlayers.map((p) => (
            <li key={p.playerId} className='flex items-center justify-between gap-3 text-xs'>
              <div className='flex min-w-0 items-center gap-2'>
                <span className='mt-0.5 inline-block min-h-3 min-w-3 rounded-sm' style={{ backgroundColor: p.color }} />
                <span className='truncate'>{p.nickname}</span>
              </div>
              <span className='shrink-0 whitespace-nowrap'>{p.score}점</span>
            </li>
          ))}
        </ul>

        <Button onClick={onSkip} disabled={isCountingDown}>
          스킵 {!!skip && `${skip.current} / ${skip.required}`}
        </Button>
      </div>
    </>
  );
}
