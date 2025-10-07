'use client';

import { useEffect, useState } from 'react';
import socket from '@/lib/socket';

export default function Home() {
  const [roomId, setRoomId] = useState('123');
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    // 서버에서 오는 이벤트 받기
    socket.on('room:update', (payload) => {
      console.log(payload);
    });

    return () => {
      // 언마운트 시 리스너 정리
      socket.off('room:update');
    };
  }, []);

  const createRoom = () => {
    socket.emit('room:create', null, (res: any) => {
      if (res.ok) {
        alert(`방 생성 완료! 코드: ${res.roomId}`);
        setRoomId(res.roomId);
      } else {
        alert('방 생성 실패');
      }
    });
  };

  return (
    <div className='font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <ol className='font-mono list-inside list-decimal text-sm/6 text-center sm:text-left'>
          <li className='mb-2 tracking-[-.01em]'>
            Get started by editing{' '}
            <code className='bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded'>
              src/app/page.tsx
            </code>
            .
          </li>
          <li className='tracking-[-.01em]'>Save and see your changes instantly.</li>
          <button className='bg-red-300' onClick={() => createRoom()}>
            createRoom
          </button>
        </ol>
      </main>
    </div>
  );
}
