'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { fetchPlaylistsClient } from '@/services/playlists/client';

import PlaylistTable from '@/app/playlists/_components/PlaylistTable';
import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';

import type { FindPlaylistsResponse } from '@/services/playlists/types';

interface Props {
  initialData: InfiniteData<FindPlaylistsResponse, number>;
  limit: number;
}

export default function PlaylistListSection({ initialData, limit }: Props) {
  const [input, setInput] = useState('');
  const [activeQ, setActiveQ] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['playlists', { q: activeQ, limit }],
    queryFn: ({ pageParam }) => fetchPlaylistsClient({ q: activeQ, limit, offset: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined),
    initialData: activeQ === '' ? initialData : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const allPlaylists = useMemo(() => data?.pages.flatMap((page) => page.playlists) ?? [], [data]);

  const onSearch = () => {
    setActiveQ(input.trim());
  };

  const onLoadMore = async () => {
    await fetchNextPage();
  };

  return (
    <div className='flex flex-col gap-8'>
      <InputField
        className='max-w-md'
        type='search'
        value={input}
        onChange={(v) => setInput(v)}
        placeholder='플레이리스트 검색'
        onClickIcon={onSearch}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      />

      <section>
        <PlaylistTable playlists={allPlaylists} />

        {hasNextPage && (
          <div className='mt-10 flex justify-center'>
            <Button
              color='gray'
              className='w-full md:w-80'
              onClick={onLoadMore}
              disabled={isFetchingNextPage || isLoading}
            >
              더보기
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
