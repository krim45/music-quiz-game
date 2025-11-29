'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { connectSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';

import RoomSettingsSection from '@/app/room/create/_components/RoomSettingsSection';
import SongGuideSection from '@/app/room/create/_components/SongGuideSection';
import SongFormSection from '@/app/room/create/_components/SongFormSection';
import SongListSection from '@/app/room/create/_components/SongListSection';

import { useSongForm } from '@/app/room/create/_hooks/useSongForm';

import Button from '@/components/button/Button';

import type { RoomInfo } from '@/app/room/create/_types';

export default function CreateRoomPage() {
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({ title: '', password: '', isPublic: true });
  const { playerRef } = useYouTubePlayer('preview', { width: '100%', height: '100%' });
  const { songInfo, songList, showPreview, updateSongInfo, loadPreview, addSong, handleSongChange, handleRemoveSong } =
    useSongForm(playerRef);
  const router = useRouter();

  const updateRoomInfo = (key: keyof RoomInfo, value: RoomInfo[keyof RoomInfo]) => {
    setRoomInfo((prev) => ({ ...prev, [key]: value }));
  };

  const createRoom = () => {
    const socket = connectSocket();

    socket.emit(
      'room:create',
      {
        title: roomInfo.title,
        password: roomInfo.password,
        songList,
      },
      (res: { ok: boolean; roomId?: string }) => {
        if (!res.ok || !res.roomId) {
          toast.error('방 생성 실패');
          return;
        }
        router.push(`/room/${res.roomId}`);
      }
    );
  };

  return (
    <div className='flex w-full max-w-5xl flex-col items-center gap-7 p-6'>
      <h1 className='text-center text-3xl font-bold'>게임 생성</h1>

      <RoomSettingsSection roomInfo={roomInfo} onChange={updateRoomInfo} />

      <div className='w-full border-t border-gray-700'></div>

      <div className='flex w-full flex-col gap-5'>
        <h2 className='text-2xl font-bold'>노래 추가</h2>

        <SongGuideSection />

        <SongFormSection
          songInfo={songInfo}
          showPreview={showPreview}
          onChange={updateSongInfo}
          onLoadPreview={loadPreview}
          onAddSong={addSong}
        />

        <SongListSection songList={songList} onChangeSong={handleSongChange} onRemoveSong={handleRemoveSong} />
      </div>

      <Button className='w-full md:w-[25%]' size='lg' onClick={createRoom}>
        게임 생성
      </Button>
    </div>
  );
}
