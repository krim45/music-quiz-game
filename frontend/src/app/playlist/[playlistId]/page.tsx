import Link from 'next/link';
import { fetchPlaylistDetailServer } from '@/services/playlists/server';

import GoBack from '@/components/nav/GoBack';
import Button from '@/components/button/Button';

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: playlist.name,
    numTracks: songs.length,
    description: playlist.description || `${playlist.name} 음악 퀴즈 플레이리스트`,
    track: songs.map((song) => ({
      '@type': 'MusicRecording',
      name: song.title,
      byArtist: {
        '@type': 'MusicGroup',
        name: song.singer,
      },
      url: song.url,
    })),
  };

  return (
    <div className='min-h-screen w-full bg-black/95 text-white'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className='pt-4 pl-6'>
        <GoBack href='/playlists'>플레이리스트 목록</GoBack>
      </nav>

      <div className='mx-auto max-w-3xl p-6'>
        <section className='mb-8 text-center'>
          <h1 className='mb-4 text-3xl font-bold md:text-4xl'>{playlist.name}</h1>
          <p className='mb-6 text-gray-400'>
            {playlist.description || `총 ${songs.length}곡이 수록된 플레이리스트입니다.`}
          </p>

          <Link href={`/room/new?playlistId=${playlist.id}`}>
            <Button className='rounded-xl !p-4'>🎮 게임 시작하기</Button>
          </Link>
        </section>

        <section>
          <div className='mb-4 flex items-end justify-between border-b border-gray-700 pb-2'>
            <h2 className='text-xl font-bold'>수록곡 목록 ({songs.length})</h2>
          </div>

          <ul className='divide-y divide-gray-800 rounded-lg bg-gray-900/50 p-2'>
            {songs.map((song, index) => (
              <li key={song.id} className='flex flex-col gap-2 rounded-md p-4 transition hover:bg-gray-800/50'>
                <div className='flex justify-between gap-4'>
                  <div className='flex gap-4 overflow-hidden'>
                    <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-800 font-mono text-sm text-gray-400'>
                      {index + 1}
                    </span>

                    <div className='flex flex-col gap-2'>
                      <div className='truncate text-lg leading-tight font-bold'>
                        <span className='text-gray-200'>{song.singer} - </span> {song.title}
                      </div>

                      {song.extraAnswers && <div className='text-xs text-gray-600'>추가 정답: {song.extraAnswers}</div>}
                    </div>
                  </div>

                  <div className='shrink-0'>
                    <a
                      href={song.url}
                      target='_blank'
                      rel='noreferrer'
                      className='rounded-md border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 hover:text-white'
                    >
                      듣기
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
