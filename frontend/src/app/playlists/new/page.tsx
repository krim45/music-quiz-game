import PlaylistClient from '@/app/playlists/new/_components/PlaylistClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '플레이리스트 만들기',
  description: '나만의 플레이리스트를 만들어 즐겨보세요.',
  alternates: { canonical: '/playlists/new' },
};

export default function NewPlaylistPage() {
  return <PlaylistClient />;
}
