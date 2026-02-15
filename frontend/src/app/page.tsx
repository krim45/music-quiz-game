import Image from 'next/image';
import Link from 'next/link';

import ArcadeMenu from '@/components/menu/ArcadeMenu';

export default function HomePage() {
  const divider = 'h-4 w-0.5 bg-gray-600';
  const anchor = 'hover:text-white text-sm';

  return (
    <div className='flex w-full flex-col items-center'>
      <div className='relative mt-20 aspect-video w-full max-w-xl'>
        <Image
          className='w-full object-contain'
          src='/images/main_logo.webp'
          alt='노래 맞히기 게임 로고'
          width={576}
          height={301}
          loading='eager'
          fetchPriority='high'
          sizes='(max-width: 640px) 100vw, 576px'
          draggable={false}
        />
      </div>

      <ArcadeMenu
        className='mt-10'
        items={[
          { label: '게임 참가', href: '/room/join' },
          { label: '게임 만들기', href: '/room/new' },
          { label: 'NEW 플레이리스트', href: '/playlist/new' },
        ]}
      />

      <footer className='mt-10 flex items-center justify-center gap-4 text-gray-400'>
        <Link className={anchor} href='/about'>
          소개
        </Link>

        <div className={divider}></div>

        <Link className={anchor} href='/privacy'>
          개인정보처리방침
        </Link>

        <div className={divider}></div>

        <Link className={anchor} href='/terms'>
          이용약관
        </Link>
      </footer>
    </div>
  );
}
