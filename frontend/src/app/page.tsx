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
          className='object-contain'
          src='/images/main_logo.png'
          alt='노래 맞추기 게임 로고'
          fill
          fetchPriority='high'
          sizes='(max-width: 640px) 100vw, 576px'
          draggable={false}
        />
      </div>

      <ArcadeMenu
        className='mt-10'
        items={[
          { label: '게임 참가', href: '/room/join' },
          { label: '게임 생성', href: '/room/create' },
        ]}
      />

      <div className='mt-10 flex items-center justify-center gap-4 text-gray-600'>
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
      </div>
    </div>
  );
}
