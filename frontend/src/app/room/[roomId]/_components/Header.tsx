'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { useSyncYoutubeAudio } from '@/hooks/useSyncYoutubeAudio';

import Menu from '@/components/icon/Menu';
import HowToPlayModal from '@/app/room/[roomId]/_components/HowToPlayModal';
import PopupMenu, { type PopupMenuItem } from '@/components/menu/PopupMenu';
import VolumeControl from '@/components/VolumeControl';

interface Props {
  playerRef: React.RefObject<YT.Player | null>;
  isReady: boolean;
}

const Header = ({ playerRef, isReady }: Props) => {
  const router = useRouter();
  const [volume, setVolume] = useState<number>(0.5);
  const [mute, setMute] = useState<boolean>(false);
  const [hasSeen, setHasSeen, ready] = useLocalStorageState<boolean>('hasSeenHowToPlay', false);

  useSyncYoutubeAudio({ playerRef, isReady, volume, mute });

  const menuItems: PopupMenuItem[] = [
    {
      key: 'howToPlay',
      content: '게임 방법',
      onSelect: () => setHasSeen((prev) => !prev),
    },
    {
      key: 'leave',
      content: '나가기',
      onSelect: () => {
        router.push('/room/join');
      },
    },
  ];

  return (
    <>
      <div className='flex w-full flex-none items-center justify-start gap-4 px-4 py-2'>
        <PopupMenu items={menuItems}>
          <button
            type='button'
            className='inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-gray-300 hover:text-black'
          >
            <Menu size={24} />
          </button>
        </PopupMenu>

        <VolumeControl value={volume} onChange={(v) => setVolume(v)} mute={mute} setMute={setMute} />
      </div>

      <HowToPlayModal open={ready && !hasSeen} onClose={() => setHasSeen(true)} />
    </>
  );
};

export default Header;
