'use client';

import { useRouter } from 'next/navigation';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';

import Menu from '@/components/icon/Menu';
import HowToPlayModal from '@/app/room/[roomId]/_components/HowToPlayModal';
import PopupMenu, { type PopupMenuItem } from '@/components/menu/PopupMenu';
import VolumeControl from '@/components/VolumeControl';

interface Props {
  volume: number;
  setVolume: (v: number) => void;
  mute: boolean;
  setMute: (v: boolean) => void;
}

const Header = ({ volume, setVolume, mute, setMute }: Props) => {
  const [hasSeen, setHasSeen, ready] = useLocalStorageState<boolean>('hasSeenHowToPlay', false);
  const open = ready && !hasSeen;
  const router = useRouter();

  const items: PopupMenuItem[] = [
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
      <div className='flex w-full items-center justify-between gap-4 px-4 py-2 md:justify-start'>
        <PopupMenu items={items}>
          <button
            type='button'
            className='inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-gray-300 hover:text-black'
          >
            <Menu size={24} />
          </button>
        </PopupMenu>

        <VolumeControl value={volume} onChange={(v) => setVolume(v)} mute={mute} onToggleMute={() => setMute(!mute)} />
      </div>

      <HowToPlayModal open={open} onClose={() => setHasSeen(true)} />
    </>
  );
};

export default Header;
