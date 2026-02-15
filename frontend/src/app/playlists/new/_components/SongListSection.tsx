'use client';

import { useState } from 'react';
import Table, { type TableColumn } from '@/components/table/Table';
import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';
import Minus from '@/components/icon/Minus';
import SongSearchModal from '@/app/playlists/new/_components/SongSearchModal';

import type { SongInfo, SongItem } from '@/services/songs/types';

interface Props {
  songList: SongInfo[];
  onChangeSong: (row: number, key: keyof SongInfo, value: SongInfo[keyof SongInfo]) => void;
  onRemoveSong: (row: number) => void;
  onAddSearchSong: (songs: SongItem[]) => void;
}

export default function SongListSection({ songList, onChangeSong, onRemoveSong, onAddSearchSong }: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const columns: TableColumn<SongInfo>[] = [
    {
      key: '_edit',
      className: 'w-[46px] !p-0 text-center',
      render: ({ rowIndex }: { rowIndex: number }) => (
        <Button className='mt-[7px]' color='red' onClick={() => onRemoveSong(rowIndex)}>
          <Minus size={20} />
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
          value={row[key]}
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
          value={row[key]}
          onChange={(v) => onChangeSong(rowIndex, key, Number(v))}
        />
      ),
    },
    { key: 'url', label: '링크', className: 'w-[350px]' },
  ];

  return (
    <div className='flex w-full flex-col gap-5'>
      <div className='flex justify-between'>
        <h2 className='text-2xl font-bold'>노래 목록 ({songList.length})</h2>

        <Button className='!px-2' size='sm' color='orange' onClick={() => setOpen((prev) => !prev)}>
          노래 검색
        </Button>
      </div>

      <Table className='h-[500px]' stickyHead columns={columns} data={songList} />

      <SongSearchModal
        open={open}
        onClose={() => setOpen(false)}
        onAdd={(selectedSongs) => onAddSearchSong(selectedSongs)}
      />
    </div>
  );
}
