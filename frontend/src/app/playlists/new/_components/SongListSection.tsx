'use client';

import { useState } from 'react';

import Table, { type TableColumn } from '@/components/table/Table';
import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';
import Minus from '@/components/icon/Minus';
import Play from '@/components/icon/Play';
import SongSearchModal from '@/app/playlists/new/_components/SongSearchModal';
import PreviewModal from '@/app/playlists/new/_components/PreviewModal';

import type { SongInfo, SongItem } from '@/services/songs/types';

interface Props {
  songList: SongInfo[];
  onChangeSong: (row: number, key: keyof SongInfo, value: SongInfo[keyof SongInfo]) => void;
  onRemoveSong: (row: number) => void;
  onAddSearchSong: (songs: SongItem[]) => void;
}

export default function SongListSection({ songList, onChangeSong, onRemoveSong, onAddSearchSong }: Props) {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedSong, setSelectedSong] = useState<SongInfo | null>(null);
  const [previewRow, setPreviewRow] = useState<number | null>(null);

  // 시작 시간을 되돌려줘야 하므로 어느 행인지도 같이 기억한다
  const loadPreview = (song: SongInfo, rowIndex: number) => {
    setIsPreviewOpen(true);
    setSelectedSong(song);
    setPreviewRow(rowIndex);
  };

  const columns: TableColumn<SongInfo>[] = [
    {
      key: '_edit',
      label: '삭제',
      className: 'w-10 p-1! text-center',
      render: ({ rowIndex }) => (
        <Button className='mt-1.5 h-7!' size='sm' color='red' onClick={() => onRemoveSong(rowIndex)}>
          <Minus className='mb-0.5' size={18} />
        </Button>
      ),
    },
    {
      key: '_preview',
      label: '미리보기',
      className: 'w-16 p-1! text-center',
      render: ({ row, rowIndex }) => (
        <Button className='mt-1 h-7!' size='sm' color='green' onClick={() => loadPreview(row, rowIndex)}>
          <Play size={18} />
        </Button>
      ),
    },
    { key: 'singer', label: '가수', sortable: true, className: 'w-[120px]' },
    { key: 'title', label: '제목', sortable: true, className: 'w-[160px]' },
    {
      key: 'extraAnswers',
      label: '추가 정답',
      className: 'w-[240px]',
      render: ({ row, key, rowIndex }) => (
        <BaseInput
          className='w-full border border-white p-2'
          value={row[key] ?? ''}
          onChange={(v) => onChangeSong(rowIndex, key, v)}
          placeholder='복수 정답 가능, 쉼표로 구분'
        />
      ),
    },
    {
      key: 'startSeconds',
      label: '시작시간(초)',
      className: 'w-[110px]',
      render: ({ row, key, rowIndex }) => (
        <BaseInput
          type='number'
          className='w-full border border-white p-2'
          value={row[key] ?? ''}
          onChange={(v) => onChangeSong(rowIndex, key, v === '' ? v : Number(v))}
        />
      ),
    },
    { key: 'url', label: '링크', className: 'w-[350px]' },
  ];

  return (
    <div className='flex w-full flex-col gap-5'>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>노래 목록 ({songList.length})</h2>

        <Button className='px-2!' size='sm' color='orange' onClick={() => setIsSearchOpen((prev) => !prev)}>
          노래 검색
        </Button>
      </div>

      <Table className='h-125' stickyHead columns={columns} data={songList} />

      <SongSearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onAdd={(selectedSongs) => onAddSearchSong(selectedSongs)}
      />

      {isPreviewOpen && selectedSong && (
        <PreviewModal
          open={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          songInfo={selectedSong}
          onPickStart={(seconds) => {
            if (previewRow === null) return;
            // 목록 행만 갱신한다. selectedSong까지 바꾸면 songInfo가 변해
            // 모달이 영상을 다시 불러오면서 재생이 끊긴다.
            onChangeSong(previewRow, 'startSeconds', seconds);
          }}
        />
      )}
    </div>
  );
}
