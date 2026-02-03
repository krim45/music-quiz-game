import type { Metadata } from 'next';

import GoBack from '@/components/nav/GoBack';
import CreateRoomClient from '@/app/room/create/_components/CreateRoomClient';

export const metadata: Metadata = {
  title: '게임 방 생성',
  description: '노래 맞추기 게임을 만들어 친구들과 즐겨보세요.',
  alternates: { canonical: '/room/create' },
};

export default function CreateRoomPage() {
  return (
    <>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          홈으로
        </GoBack>
      </nav>

      <CreateRoomClient />
    </>
  );
}
