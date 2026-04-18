'use client';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import Button from '@/components/button/Button';
import type { SkipState } from '@/types/game';

type Props = {
  roomId: string;
  currentSongIndex?: number;
  skip?: SkipState;
  disabled: boolean;
};

export default function GameSkipButton({ roomId, currentSongIndex, skip, disabled }: Props) {
  const onSkip = () => {
    const socket = getSocket();

    socket.emit('game:skip', { roomId, currentSongIndex }, (res: { ok: boolean; message?: string }) => {
      if (!res.ok) {
        toast.error(res.message || '스킵 실패');
      }
    });
  };

  return (
    <Button className='!px-2' type='button' size='sm' onClick={onSkip} disabled={disabled}>
      {skip ? `스킵 ${skip.current}/${skip.required}` : '스킵'}
    </Button>
  );
}
