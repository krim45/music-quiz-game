import Link from 'next/link';
import { fetchPlaylistsServer } from '@/services/playlists/server';

import PlaylistListSection from '@/app/playlists/_components/PlaylistSection';
import Button from '@/components/button/Button';
import GoBack from '@/components/nav/GoBack';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '플레이리스트 목록',
  description: '노래 맞히기 게임의 플레이리스트를 탐색하고 선택하세요.',
};

export default async function PlaylistsPage() {
  const LIMIT = 40;
  const firstPage = await fetchPlaylistsServer({ limit: LIMIT, offset: 0 });
  const initialInfiniteData = { pages: [firstPage], pageParams: [0] };

  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-md' href='/'>
          홈으로
        </GoBack>
      </nav>

      <div className='m-auto flex w-full max-w-5xl flex-col p-6'>
        <header className='mb-8 flex flex-col justify-between gap-4 border-b border-gray-800 pb-6 md:flex-row'>
          <div>
            <h1 className='mb-2 text-3xl font-bold'>플레이리스트 목록</h1>
            <p className='text-gray-400'>원하는 주제의 플레이리스트를 선택하여 수록곡을 확인해보세요.</p>
          </div>

          <Link href='/playlists/new'>
            <Button size='lg'>NEW 플레이리스트 +</Button>
          </Link>
        </header>

        <PlaylistListSection initialData={initialInfiniteData} limit={LIMIT} />
      </div>
    </div>
  );
}
