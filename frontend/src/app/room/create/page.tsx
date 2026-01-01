import CreateRoomClient from '@/app/room/create/_components/CreateRoomClient';
import { fetchPlaylistsServer } from '@/app/services/playlists/server';

export default async function CreateRoomPage() {
  const limit = 20;
  const initial = await fetchPlaylistsServer({ limit, offset: 0 });

  return <CreateRoomClient initial={initial.ok ? initial : null} limit={limit} />;
}
