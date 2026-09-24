'use client';

import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSongs } from '@/services/songs/client';
import { toast } from '@/lib/store/useToastStore';

import Modal from '@/components/overlay/Modal';
import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';
import Table, { type TableColumn } from '@/components/table/Table';
import Checkbox from '@/components/form/checkbox/Checkbox';

import Play from '@/components/icon/Play';
import PreviewModal from '@/app/playlists/new/_components/PreviewModal';
import type { SongInfo, SongItem } from '@/services/songs/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (songs: SongItem[]) => void;
}

export default function SongSearchModal({ open, onClose, onAdd }: Props) {
  const limit = 50;

  const [input, setInput] = useState('');
  const [q, setQ] = useState<string>('');

  const [selectedMap, setSelectedMap] = useState<Map<string, SongItem>>(new Map());
  const [previewSong, setPreviewSong] = useState<SongInfo | null>(null);

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
    {
      // 데이터 열이 아니므로 CustomColumn으로 둔다.
      // 'url'처럼 이미 쓰는 키를 재사용하면 React key가 겹친다.
      key: '_preview',
      accessor: () => null,
      label: '미리보기',
      className: 'w-16 p-1! text-center',
      render: ({ row }) => (
        <Button
          className='mt-1 h-7!'
          size='sm'
          color='green'
          onClick={() =>
            // 이미 등록된 곡이라 구간이 정해져 있다. 여기서는 듣기만 한다.
            setPreviewSong({
              songId: row.id,
              url: row.url,
              title: row.title,
              singer: row.singer,
              startSeconds: row.startSeconds,
              endSeconds: row.endSeconds,
              extraAnswers: row.extraAnswers,
            })
          }
        >
          <Play size={18} />
        </Button>
      ),
    },
    { key: 'singer', label: '가수', sortable: true, className: 'w-[120px]' },
    { key: 'title', label: '제목', sortable: true, className: 'w-[120px]' },
    {
      key: 'extraAnswers',
      label: '추가 정답',
      className: 'w-[160px]',
      // 배열을 그대로 두면 React가 구분자 없이 이어붙인다
      render: ({ row }) => <span>{row.extraAnswers.join(', ')}</span>,
    },
  ];

  const errMsg = error instanceof Error ? error.message : null;

  const onSearch = () => {
    if (isFetching) return toast.info('검색 중');

    const nextQ = input.trim();
    setQ(nextQ);
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

    // 닫을 때 선택도 초기화하고 싶으면
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

      {previewSong && (
        <PreviewModal open onClose={() => setPreviewSong(null)} songInfo={previewSong} />
      )}
    </Modal>
  );
}
