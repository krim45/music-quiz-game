'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/store/useToastStore';
import { getSocket } from '@/lib/socket';

import InputField from '@/components/form/input/InputField';
import Button from '@/components/button/Button';
import Refresh from '@/components/icon/Refresh';
import Lock from '@/components/icon/Lock';
import Table, { type TableColumn } from '@/components/table/Table';
import type { RoomListItem } from '@/types/game';

// TODO: 첫페이지는 서버로 부터 오는게?
// 방 목록을 무한스크롤로 가져오는건?

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
    const socket = getSocket();

    fetchRooms();

    const onRoomListUpdate = (payload: { rooms: RoomListItem[] }) => {
      setRooms(payload.rooms);
    };

    socket.on('room:list:update', onRoomListUpdate);

    return () => {
      socket.off('room:list:update', onRoomListUpdate);
    };
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

  // TODO: 서버 필터링
  const filtered = rooms.filter((room) => room.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const columns: TableColumn<RoomListItem>[] = [
    {
      key: 'players',
      label: '플레이어',
      className: 'w-[76px] text-center',
      accessor: (row) => (
        <span className={clsx(row.status === 'playing' && 'text-gray-500')}>
          {`${row.curPlayers} / ${row.maxPlayers}`}
        </span>
      ),
    },
    {
      key: 'title',
      label: '방 제목',
      sortable: true,
      render: ({ row }) => {
        return (
          <span className={clsx(row.status === 'playing' && 'text-gray-500', 'flex items-center gap-1')}>
            {row.hasPassword && <Lock className='inline-flex h-4' size={16} />}
            {row.title}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: '상태',
      className: 'w-[72px] text-center',
      accessor: (row) => (
        <span className={clsx(row.status === 'playing' && 'text-gray-500')}>
          {row.status === 'playing' ? '진행 중' : '대기'}
        </span>
      ),
    },
  ];

  const onRowClick = (row: RoomListItem) => {
    if (row.status === 'playing') {
      toast.error('진행 중인 방에는 참여할 수 없습니다.');
      return;
    }

    router.push(`/room/${row.roomId}`);
  };

  return (
    <div className='flex h-full w-full max-w-3xl flex-col gap-4'>
      <div className='flex items-center gap-4'>
        <InputField
          className='flex-1'
          type='search'
          size='lg'
          value={search}
          placeholder='방 찾기'
          onChange={(v) => setSearch(v)}
          onKeyDown={handleSearch}
          onClickIcon={() => setSearchQuery(search)}
        />

        <div className='flex items-center gap-3'>
          <Button color='blue' size='lg' onClick={() => router.push('/room/new')}>
            게임 만들기
          </Button>

          <Button className='flex w-12 items-center justify-center' size='lg' color='gray' onClick={handleRefresh}>
            <Refresh size={30} />
          </Button>
        </div>
      </div>

      <Table className='h-full flex-1' stickyHead columns={columns} data={filtered} onRowClick={onRowClick} />
    </div>
  );
}
