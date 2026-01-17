'use client';

import clsx from 'clsx';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import { getPlayerId } from '@/utils/playerId';

import Button from '@/components/button/Button';

import type { Player, RoomInfo } from '@/types/game';

type Props = {
  roomId: string;
  roomInfo: RoomInfo;
  players: Player[];
};

// TODO
// 1. 강퇴기능, 동그란 x 아이콘
// 2. 방장 chip

export default function WaitingSection({ roomId, roomInfo, players }: Props) {
  const isOwner = () => {
    const myId = getPlayerId();
    const me = players.find((p) => p.playerId === myId);

    return !!me?.isOwner;
  };

  const gameStart = () => {
    const socket = getSocket();
    socket.emit('game:start', { roomId }, (res: { ok: boolean; message?: string }) => {
      if (!res.ok) {
        toast.error(res.message || '시작 실패');
        return;
      }
    });
  };

  const descClassName = 'text-center text-sm [overflow-wrap:break-word] break-keep whitespace-pre-line';

  return (
    <>
      <div className='scrollbar-custom flex flex-2 flex-col items-center justify-center gap-2 overflow-auto rounded border border-green-900 p-3'>
        <div className={clsx(descClassName, 'text-orange')}>{roomInfo.playlist.name}</div>
        <div className={descClassName}>{roomInfo.playlist.description}</div>
        <div className={clsx(descClassName, 'text-blue-500')}>{roomInfo.room.songCount}곡</div>
      </div>

      <div className='flex min-w-40 flex-1 flex-col gap-2 rounded border border-green-900 p-3'>
        <div>플레이어</div>

        <ul className='scrollbar-custom flex-1 overflow-auto'>
          {players.map((p, i) => (
            <li key={i} className='flex items-center gap-3 text-xs'>
              <div className='flex w-full items-center gap-1 overflow-hidden'>
                <span className='inline-block min-h-3 min-w-3' style={{ backgroundColor: p.color }} />
                <span className='truncate'>{p.nickname}</span>
              </div>

              {isOwner() && <div>강퇴</div>}
            </li>
          ))}
        </ul>

        {isOwner() && <Button onClick={gameStart}>게임시작</Button>}
      </div>
    </>
  );
}
