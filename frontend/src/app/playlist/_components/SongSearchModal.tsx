'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSongs } from '@/app/services/songs/client';
import Modal from '@/components/overlay/Modal';
import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';
import { toast } from '@/lib/store/useToastStore';
import Table, { type TableColumn } from '@/components/table/Table';
import Checkbox from '@/components/form/checkbox/Checkbox';
import { SongItem } from '@/app/services/songs/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (songs: SongItem[]) => void;
}

export default function SongSearchModal({ open, onClose, onAdd }: Props) {
  const limit = 50;

  const [input, setInput] = useState('');
  const [q, setQ] = useState<string>('');

  // ✅ key는 song.id(uuid)
  const [selectedMap, setSelectedMap] = useState<Map<string, SongItem>>(new Map());

  const queryKey = useMemo(() => ['songs', q] as const, [q]);

  const { data, error, isLoading, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => fetchSongs({ q, limit, offset: pageParam as number, signal }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;

      const loadedCount = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loadedCount;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items: SongItem[] = (data?.pages ?? []).flatMap((p) => p.items || []);

  const columns: TableColumn<SongItem>[] = [
    {
      key: 'id',
      label: '',
      className: 'w-[40px]',
      render: ({ row }) => (
        <div className='flex items-center justify-center'>
          <Checkbox
            size='lg'
            checked={selectedMap.has(row.id)}
            onChange={(checked) => {
              setSelectedMap((prev) => {
                const next = new Map(prev);
                if (checked) next.set(row.id, row);
                else next.delete(row.id);
                return next;
              });
            }}
          />
        </div>
      ),
    },
    { key: 'singer', label: '가수', sortable: true, className: 'w-[120px]' },
    { key: 'title', label: '제목', sortable: true, className: 'w-[120px]' },
    { key: 'extraAnswers', label: '추가 정답', className: 'w-[160px]' },
    { key: 'url', label: '링크', className: 'w-[350px]' },

    // (선택) 영상 ID를 보고 싶으면 컬럼 추가
    // { key: 'externalId', label: '영상ID', className: 'w-[140px]' },
  ];

  const errMsg = error instanceof Error ? error.message : null;

  const onSearch = () => {
    if (isFetching) return toast.info('검색 중');

    const nextQ = input.trim();
    setQ(nextQ);

    // ✅ 검색어 바뀌면 선택 초기화(현재 네 의도)
    setSelectedMap(new Map());
  };

  const onLoadMore = async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    await fetchNextPage();
  };

  const onAddClick = () => {
    if (selectedMap.size === 0) return toast.info('선택된 노래가 없어요');

    const selectedSongs = Array.from(selectedMap.values());
    onAdd(selectedSongs);

    // 취향: 닫을 때 선택도 초기화하고 싶으면
    // setSelectedMap(new Map());

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title='노래 검색'>
      <div className='flex h-full flex-col gap-3'>
        <div className='mt-2 flex gap-2'>
          <InputField
            className='flex-1'
            type='search'
            value={input}
            onChange={(v) => setInput(v)}
            placeholder='제목 또는 가수 검색'
            onClickIcon={onSearch}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch();
            }}
          />
        </div>

        {errMsg && <div>{errMsg}</div>}

        <Table className='mt-3 flex-1' stickyHead columns={columns} data={items} />

        {hasNextPage ? (
          <div className='flex justify-center'>
            <Button onClick={onLoadMore} disabled={isFetchingNextPage || isLoading}>
              {isFetchingNextPage || isLoading ? '불러오는 중...' : '더보기'}
            </Button>
          </div>
        ) : null}

        <div className='flex items-center justify-between'>
          <div className='text-sm text-zinc-400'>선택 {selectedMap.size}개</div>

          <div className='flex justify-end gap-4'>
            <Button color='gray' onClick={() => setSelectedMap(new Map())} disabled={selectedMap.size === 0}>
              선택 초기화
            </Button>

            <Button className='px-4' onClick={onAddClick} disabled={selectedMap.size === 0}>
              노래 추가 ({selectedMap.size})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
