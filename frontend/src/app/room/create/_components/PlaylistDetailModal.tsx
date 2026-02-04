'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPlaylistDetail } from '@/services/playlists/client';

import Modal from '@/components/overlay/Modal';

import type { SongItem } from '@/services/songs/types';

interface Props {
  open: boolean;
  onClose: () => void;
  playlistId: string | null;
}

export default function PlaylistDetailModal({ open, onClose, playlistId }: Props) {
  const enabled = open && Boolean(playlistId);

  const { data, isLoading } = useQuery({
    queryKey: ['playlist-detail', playlistId],
    enabled,
    queryFn: ({ signal }) => fetchPlaylistDetail({ id: playlistId!, signal }),
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const title = data?.playlist?.name ? data.playlist.name : '플레이리스트 상세';
  const songs: SongItem[] = data?.songs ?? [];

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className='flex h-full flex-col gap-3'>
        {data?.playlist?.description ? (
          <div className='text-sm whitespace-pre-wrap text-zinc-400'>{data.playlist.description}</div>
        ) : null}

        <div className='scrollbar-custom mt-2 flex-1 overflow-auto rounded border border-gray-700'>
          {isLoading ? (
            <div className='flex h-full items-center justify-center p-6 text-sm text-zinc-400'>불러오는 중...</div>
          ) : songs.length === 0 ? (
            <div className='p-6 text-sm text-zinc-400'>곡이 없어요</div>
          ) : (
            <ul className='divide-y divide-gray-700'>
              {songs.map((s) => (
                <li key={s.id} className='flex flex-col gap-1 p-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate font-medium'>
                        {s.singer} - {s.title}
                      </div>
                    </div>

                    <a
                      className='text-orange shrink-0 text-sm hover:underline'
                      href={s.url}
                      target='_blank'
                      rel='noreferrer'
                    >
                      링크
                    </a>
                  </div>

                  {s.extraAnswers ? (
                    <div className='text-xs text-zinc-500'>
                      추가 정답: <span className='text-zinc-400'>{s.extraAnswers}</span>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='text-sm text-zinc-400'>총 {songs.length}곡</div>
      </div>
    </Modal>
  );
}
