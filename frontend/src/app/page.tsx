import Image from 'next/image';
import ArcadeMenu from '@/components/menu/ArcadeMenu';

export default function HomePage() {
  return (
    <div className='flex w-full flex-col items-center'>
      <div className='relative mt-20 aspect-video w-full max-w-xl'>
        <Image src='/images/main_logo.png' alt='노래 맞추기 게임 로고' fill draggable={false} />
      </div>

      <ArcadeMenu
        items={[
          { label: '게임 참가', href: '/room/join' },
          { label: '게임 생성', href: '/room/create' },
        ]}
      />
    </div>
  );
}
