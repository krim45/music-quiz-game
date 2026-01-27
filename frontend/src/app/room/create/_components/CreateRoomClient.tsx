'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import { pushEvent } from '@/lib/analytics';

import RoomSettingsSection from '@/app/room/create/_components/RoomSettingSection';
import PlaylistSection from '@/app/room/create/_components/PlaylistSection';
import Button from '@/components/button/Button';

import type { CreateRoomPayload, RoomInfo } from '@/app/room/create/_types';
import type { FindPlaylistsResponse } from '@/app/services/playlists/types';

interface Props {
  initial: FindPlaylistsResponse | null;
  limit: number;
}

export default function CreateRoomClient({ initial, limit }: Props) {
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({ title: '', password: '', isPublic: true });
  const [playlistId, setPlaylistId] = useState<string>('');
  const router = useRouter();

  const updateRoomInfo = (patch: Partial<RoomInfo>) => {
    setRoomInfo((prev) => ({ ...prev, ...patch }));
  };

  const createRoom = () => {
    const socket = getSocket();
    const payload: CreateRoomPayload = { title: roomInfo.title, password: roomInfo.password, playlistId };

    socket.emit('room:create', payload, (res: { ok: boolean; roomId?: string; message?: string }) => {
      if (!res.ok) {
        return toast.error(res.message || '방 생성 실패');
      }

      pushEvent({ event: 'create_room' });
      router.push(`/room/${res.roomId}`);
    });
  };

  return (
    <div className='m-auto flex w-full max-w-5xl flex-col items-center gap-7 p-6'>
      <h1 className='text-center text-3xl font-bold'>게임 생성</h1>

      <RoomSettingsSection roomInfo={roomInfo} onChange={updateRoomInfo} />

      <PlaylistSection limit={limit} initial={initial} selectedId={playlistId} onSelect={setPlaylistId} />

      <Button className='w-full md:w-[25%]' size='lg' onClick={createRoom}>
        게임 생성
      </Button>
    </div>
  );
}
