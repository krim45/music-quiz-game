'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchPlaylistsClient } from '@/app/services/playlists/client';

import InputField from '@/components/form/input/InputField';
import Table, { type TableColumn } from '@/components/table/Table';
import Button from '@/components/button/Button';
import Radio from '@/components/form/radio/Radio';
import PlaylistMusic from '@/components/icon/PlaylistMusic';
import PlaylistDetailModal from '@/app/room/create/_components/PlaylistDetailModal';
import type { FindPlaylistsResponse, PlaylistListItem } from '@/app/services/playlists/types';

interface Props {
  limit: number;
  initial: FindPlaylistsResponse | null;
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function PlaylistSection({ limit, initial, selectedId, onSelect }: Props) {
  const [input, setInput] = useState('');
  const [q, setQ] = useState<string>('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const queryKey = useMemo(() => ['playlists', { q, limit }] as const, [q, limit]);
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = typeof pageParam === 'number' ? pageParam : 0;
      const data = await fetchPlaylistsClient({ q, limit, offset });

      if (!data.ok) {
        throw new Error(data.message ?? 'playlists 조회 실패');
      }
      return data;
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined),
    initialData: initial?.ok && (initial.q ?? '') === q ? { pages: [initial], pageParams: [0] } : undefined,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const items: PlaylistListItem[] = data?.pages.flatMap((p) => p.items || []);

  const openPlaylistDetail = (id: string) => {
    setDetailId(id);
  };

  const closeModal = () => setDetailId('');

  const onSearch = () => {
    if (isLoading || isFetchingNextPage) return;

    const next = input.trim();
    setQ(next);
  };

  const onLoadMore = async () => {
    await fetchNextPage();
  };

  const columns: TableColumn<PlaylistListItem>[] = [
    {
      key: 'id',
      label: '',
      className: 'w-10',
      render: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Radio name='selectedId' value={row.id} checked={row.id === selectedId} />
        </div>
      ),
    },
    { key: 'name', label: '플레이리스트' },
    {
      key: '_detail',
      label: '목록',
      className: 'w-12',
      accessor: () => null,
      render: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Button
            size='sm'
            color='green'
            onClick={(e) => {
              e?.stopPropagation();
              openPlaylistDetail(row.id);
            }}
          >
            <PlaylistMusic size={24} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='flex w-full flex-col gap-5'>
      <h2 className='text-2xl font-bold'>플레이리스트 선택</h2>

      <div className='flex h-full flex-col gap-3'>
        <div className='mt-2 flex gap-2'>
          <InputField
            className='flex-1'
            type='search'
            value={input}
            onChange={(v) => setInput(v)}
            placeholder='플레이리스트 검색'
            onClickIcon={onSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
          />
        </div>

        <Table
          className='mt-3 min-h-120 flex-1'
          stickyHead
          columns={columns}
          data={items}
          onRowClick={(row) => onSelect(row.id)}
        >
          {hasNextPage ? (
            <div className='mt-3 flex justify-center'>
              <Button color='gray' onClick={onLoadMore} disabled={isFetchingNextPage || isLoading}>
                {isFetchingNextPage || isLoading ? '불러오는 중...' : '더보기'}
              </Button>
            </div>
          ) : null}
        </Table>
      </div>

      <PlaylistDetailModal open={!!detailId} playlistId={detailId} onClose={closeModal} />
    </div>
  );
}
