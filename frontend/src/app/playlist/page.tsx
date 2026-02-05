import PlaylistClient from '@/app/playlist/_components/PlaylistClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '플레이리스트 만들기',
  description: '나만의 플레이리스트를 만들어 즐겨보세요.',
  alternates: { canonical: '/playlist' },
};

export default function PlaylistPage() {
  return <PlaylistClient />;
}
