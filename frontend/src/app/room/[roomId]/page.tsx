import RoomClient from '@/app/room/[roomId]/_components/RoomClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RoomClient />;
}
