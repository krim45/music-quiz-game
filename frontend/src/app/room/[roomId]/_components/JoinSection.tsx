'use client';

import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import { setPlayerId } from '@/utils/playerId';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { loadAllSounds, unlockSound } from '@/sounds/systemSound';

import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';

type Props = {
  roomId: string;
  title: string;
  hasPassword: boolean;
  playerRef: React.RefObject<YT.Player | null>;
  onJoined: () => void;
};

export default function JoinSection({ roomId, title, hasPassword, playerRef, onJoined }: Props) {
  const [nickname, setNickname] = useLocalStorageState('nickname', '');
  const [password, setPassword] = useState<string>('');

  // 방 입장
  const handleJoin = async () => {
    if (!playerRef.current) {
      toast.error('로딩 중 입니다.');
      return;
    }

    // 오디오 정책 우회용 코드
    try {
      playerRef.current.playVideo();
      playerRef.current.stopVideo();
      await unlockSound();
      await loadAllSounds();
    } catch (e) {
      console.warn('audio unlock/load failed', e);
    }

    const socket = getSocket();
    const payload = { roomId, nickname, password };

    socket.emit('room:join', payload, (res: { ok: boolean; playerId: string; message?: string }) => {
      if (!res.ok) {
        toast.error(res.message || '입장 실패');
        return;
      }

      setPlayerId(res.playerId);
      onJoined();
    });
  };

  return (
    <div className='flex w-full flex-1 items-center justify-center p-6'>
      <form
        className='flex h-fit w-full max-w-xl flex-col gap-4 rounded-md border p-6'
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
      >
        <h2 className='mb-4 text-2xl'>{title}</h2>

        <InputField
          autoFocus
          label='닉네임'
          charLimit={10}
          placeholder='2 ~ 10자'
          value={nickname}
          onChange={(v) => setNickname(v)}
        />

        {hasPassword && <InputField type='password' label='방 비밀번호' value={password} onChange={setPassword} />}

        <Button type='submit' color='green'>
          입장
        </Button>
      </form>
    </div>
  );
}
