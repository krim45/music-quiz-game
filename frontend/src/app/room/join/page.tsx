import type { Metadata } from 'next';

import GoBack from '@/components/nav/GoBack';
import JoinClient from '@/app/room/join/JoinClient';

export const metadata: Metadata = {
  title: '게임 방 참가',
  description: '노래 맞추기 게임 방에 참가하세요.',
  alternates: { canonical: '/room/join' },
};

export default function JoinPage() {
  return (
    <>
      <div className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          <span>홈으로</span>
        </GoBack>
      </div>

      <div className='flex h-full w-full flex-col items-center pt-4'>
        <div className='flex h-full w-full max-w-xl flex-col items-center px-4 pb-6'>
          <h1 className='mb-6 text-3xl font-bold'>게임 찾기</h1>

          <JoinClient />
        </div>
      </div>
    </>
  );
}
