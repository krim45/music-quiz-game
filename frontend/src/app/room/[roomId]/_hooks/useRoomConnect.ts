'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';

type Params = {
  roomId: string;
};

export function useRoomConnect({ roomId }: Params) {
  const router = useRouter();

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => toast.success('재연결되었습니다.');

    const onDisconnect = (reason: string) => {
      router.replace('/room/join');
      toast.error(`서버 연결이 끊겼습니다. ${reason}`);
    };

    const onLeave = (res: { ok: boolean }) => {
      if (res.ok) {
        toast.success('방을 떠났습니다.');
        return;
      }
    };

    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
      socket.emit('room:leave', { roomId }, onLeave);
    };
  }, [roomId, router]);
}
