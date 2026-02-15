'use client';

import { useRouter } from 'next/navigation';

import Table, { type TableColumn } from '@/components/table/Table';
import Button from '@/components/button/Button';

import type { PlaylistListItem } from '@/services/playlists/types';

interface Props {
  playlists: PlaylistListItem[];
}

export default function PlaylistTable({ playlists }: Props) {
  const router = useRouter();

  const handleRowClick = ({ id }: PlaylistListItem) => {
    router.push(`/playlists/${id}`);
  };

  const columns: TableColumn<PlaylistListItem>[] = [
    {
      key: 'name',
      label: '제목',
      sortable: true,
      render: ({ row }) => <div className='hover:text-orange text-xl font-bold'>{row.name}</div>,
    },
  ];

  if (playlists.length === 0) {
    return (
      <div className='flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-gray-800 bg-gray-900/30 text-gray-500'>
        <p>생성된 플레이리스트가 없습니다.</p>
        <Button className='!px-3' size='sm' onClick={() => router.push('/playlists/new')}>
          NEW 플레이리스트 +
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <Table columns={columns} data={playlists} className='w-full' onRowClick={handleRowClick} />
    </div>
  );
}
