'use client';

import Table, { type TableColumn } from '@/components/table/Table';
import BaseInput from '@/components/form/input/BaseInput';
import Button from '@/components/button/Button';
import Minus from '@/components/icon/Minus';

import type { SongInfo } from '@/app/room/create/_types';

interface Props {
  songList: SongInfo[];
  onChangeSong: (row: number, key: keyof SongInfo, value: string) => void;
  onRemoveSong: (row: number) => void;
}

export default function SongListSection({ songList, onChangeSong, onRemoveSong }: Props) {
  const renderCell = (ctx: { value: SongInfo[keyof SongInfo]; rowIndex: number; key: keyof SongInfo }) => (
    <BaseInput
      className='w-full border border-white p-2'
      value={String(ctx.value ?? '')}
      onChange={(v) => onChangeSong(ctx.rowIndex, ctx.key, v)}
    />
  );

  const columns: TableColumn<SongInfo>[] = [
    {
      key: '_edit',
      className: 'w-[44px] text-center',
      render: ({ rowIndex }) => (
        <div className='flex justify-center'>
          <Button className='p-1' color='red' onClick={() => onRemoveSong(rowIndex)}>
            <Minus size={18} />
          </Button>
        </div>
      ),
    },
    { key: 'singer', label: '가수', sortable: true, className: 'w-[120px]' },
    { key: 'title', label: '제목', sortable: true, className: 'w-[160px]' },
    { key: 'extraAnswers', label: '추가 정답', className: 'w-[240px]', render: renderCell },
    { key: 'startSeconds', label: '시작시간', className: 'w-[74px]', render: renderCell },
    { key: 'url', label: '링크', className: 'w-[350px]' },
  ];

  return (
    <div className='flex w-full flex-col gap-5'>
      <h2 className='text-2xl font-bold'>노래 목록 ({songList.length})</h2>
      <Table className='h-[500px]' stickyHead columns={columns} data={songList} />
    </div>
  );
}
