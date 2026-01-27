import CreateRoomClient from '@/app/room/create/_components/CreateRoomClient';
import { fetchPlaylistsServer } from '@/app/services/playlists/server';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '게임 방 생성',
  description: '노래 맞추기 게임을 만들어 친구들과 즐겨보세요.',
  alternates: { canonical: '/room/create' },
};

export default async function CreateRoomPage() {
  const limit = 20;
  const initial = await fetchPlaylistsServer({ limit, offset: 0 });

  return <CreateRoomClient initial={initial.ok ? initial : null} limit={limit} />;
}
