'use client';

import clsx from 'clsx';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import { getPlayerId } from '@/utils/playerId';

import Button from '@/components/button/Button';

import type { Player, RoomInfo } from '@/types/game';
import Close from '@/components/icon/Close';

type Props = {
  roomId: string;
  roomInfo: RoomInfo;
  players: Player[];
};

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

  const kickPlayer = (targetPlayerId: string, nickname: string) => {
    const result = confirm(`'${nickname}'님을 추방합니다`);
    if (!result) return;

    const socket = getSocket();

    socket.emit('room:kick', { roomId, targetPlayerId }, (res: { ok: boolean; message?: string }) => {
      if (!res.ok) {
        toast.error(res.message || '실패');
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
          {players.map((p) => (
            <li key={p.playerId} className='flex gap-3 text-xs'>
              <div className='flex w-full items-center gap-1 overflow-hidden'>
                <span className='inline-block min-h-3 min-w-3' style={{ backgroundColor: p.color }} />
                <span className='truncate'>{p.nickname}</span>
              </div>

              {isOwner() && !p.isOwner && (
                <Close
                  className='flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-700 text-white hover:bg-white hover:text-black'
                  size={12}
                  onClick={() => kickPlayer(p.playerId, p.nickname)}
                >
                  강퇴
                </Close>
              )}
            </li>
          ))}
        </ul>

        {isOwner() && <Button onClick={gameStart}>게임시작</Button>}
      </div>
    </>
  );
}
