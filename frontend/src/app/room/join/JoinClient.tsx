'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/store/useToastStore';
import { getSocket } from '@/lib/socket';

import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';
import Refresh from '@/components/icon/Refresh';
import Table, { type TableColumn } from '@/components/table/Table';
import type { RoomListItem } from '@/types/room';

export default function JoinClient() {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchRooms = () => {
    const socket = getSocket();

    socket.emit('room:list', (res: { ok: boolean; rooms: RoomListItem[] }) => {
      if (res.ok) {
        setRooms(res.rooms);
      } else {
        toast.error('게임 목록 오류');
      }
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(e.currentTarget.value.trim());
    }
  };

  const handleRefresh = () => {
    setSearch('');
    setSearchQuery('');
    fetchRooms();
  };

  const filtered = rooms.filter((room) => room.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: TableColumn<RoomListItem>[] = [
    {
      key: 'players',
      label: '플레이어',
      className: 'w-[74px] text-center',
      accessor: (row) => `${row.curPlayers} / ${row.maxPlayers}`,
    },
    { key: 'title', label: '게임 제목', sortable: true },
  ];

  return (
    <div className='flex h-full w-full max-w-3xl flex-col gap-4'>
      <div className='flex items-center gap-4'>
        <InputField
          className='flex-1'
          type='search'
          size='lg'
          value={search}
          placeholder='게임 제목으로 검색'
          onChange={(v) => setSearch(v)}
          onKeyDown={handleSearch}
          onClickIcon={() => setSearchQuery(search)}
        />

        <div className='flex items-center gap-3'>
          <Button color='blue' size='lg' onClick={() => router.push('/room/create')}>
            게임 생성
          </Button>

          <Button className='flex w-12 items-center justify-center' size='lg' color='gray' onClick={handleRefresh}>
            <Refresh size={30} />
          </Button>
        </div>
      </div>

      <Table
        className='h-full flex-1'
        stickyHead
        columns={columns}
        data={filtered}
        onRowClick={(row) => router.push(`/room/${row.roomId}`)}
      />
    </div>
  );
}
