import GoBack from '@/components/nav/GoBack';
import { fetchPlaylistDetailServer } from '@/services/playlists/server';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ playlistId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { playlistId } = await params;
  const { playlist, songs } = await fetchPlaylistDetailServer(playlistId);
  const description = playlist.description ? `${playlist.description} | ` : '';

  return {
    title: `${playlist.name} - 수록곡 목록 및 퀴즈 풀기`,
    description: `${description}${playlist.name} 플레이리스트에 수록된 ${songs.length}곡의 노래 목록입니다.`,
  };
}

export default async function PlaylistDetail({ params }: Props) {
  const { playlistId } = await params;
  const { playlist, songs } = await fetchPlaylistDetailServer(playlistId);

  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-sm' href='/playlists'>
          플레이리스트 목록
        </GoBack>
      </nav>

      <div className='mx-auto max-w-3xl p-6'>
        <section className='mb-8'>
          <h1 className='mb-4 text-3xl font-bold'>{playlist.name}</h1>
          {playlist.description && <p className='leading-relaxed text-gray-400'>{playlist.description}</p>}
        </section>

        <section>
          <h2 className='mb-4 text-2xl font-bold'>총: {songs.length}곡</h2>

          <ul className='divide-y divide-gray-700 rounded-lg border border-gray-700'>
            {songs.map((song, index) => (
              <li key={song.id} className='flex flex-col gap-1 p-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='text-lg font-semibold'>
                      {index + 1}. {song.singer} - {song.title}
                    </h3>

                    {song.extraAnswers && (
                      <div className='text-xs text-gray-500'>
                        추가 정답: <span className='text-gray-400'>{song.extraAnswers}</span>
                      </div>
                    )}
                  </div>

                  <a href={song.url} target='_blank' rel='noreferrer' className='text-orange underline'>
                    듣기
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
