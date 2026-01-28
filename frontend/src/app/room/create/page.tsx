import type { Metadata } from 'next';
import { fetchPlaylistsServer } from '@/app/services/playlists/server';

import GoBack from '@/components/nav/GoBack';
import CreateRoomClient from '@/app/room/create/_components/CreateRoomClient';

export const metadata: Metadata = {
  title: '게임 방 생성',
  description: '노래 맞추기 게임을 만들어 친구들과 즐겨보세요.',
  alternates: { canonical: '/room/create' },
};

export default async function CreateRoomPage() {
  const limit = 20;
  const initial = await fetchPlaylistsServer({ limit, offset: 0 });

  return (
    <>
      <div className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          <span>홈으로</span>
        </GoBack>
      </div>

      <CreateRoomClient initial={initial.ok ? initial : null} limit={limit} />
    </>
  );
}
