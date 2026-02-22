'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/store/useToastStore';
import { createPlaylistClient } from '@/services/playlists/client';

import Button from '@/components/button/Button';
import GoBack from '@/components/nav/GoBack';
import InputField from '@/components/form/input/InputField';
import SongGuideSection from '@/app/playlists/new/_components/SongGuideSection';
import SongFormSection from '@/app/playlists/new/_components/SongFormSection';
import SongListSection from '@/app/playlists/new/_components/SongListSection';

import type { SongInfo, SongItem } from '@/services/songs/types';

export default function PlaylistClient() {
  const [name, setName] = useState<string>('');
  const [songList, setSongList] = useState<SongInfo[]>([]);

  const router = useRouter();

  const addSongToList = (newSong: SongInfo) => {
    setSongList((prev) => [...prev, newSong]);
  };

  const handleSongChange = (rowIndex: number, key: keyof SongInfo, value: SongInfo[keyof SongInfo]) => {
    setSongList((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [key]: value };
      return next;
    });
  };

  const handleRemoveSong = (rowIndex: number) => {
    setSongList((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  const createPlaylist = async () => {
    const trimmed = name.trim();
    if (!trimmed) return toast.error('플레이리스트 이름을 입력해주세요.');

    if (songList.length < 5) return toast.error('노래를 5곡 이상 추가하세요.');

    try {
      await createPlaylistClient({ name: trimmed, songs: songList });

      toast.success('플레이리스트 생성 완료');
      router.push('/room/new');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '플레이리스트 생성 실패');
    }
  };

  const addSearchSong = (songs: SongItem[]) => {
    if (!songs.length) return;

    setSongList((prev) => {
      const existing = new Set(prev.map((s: SongInfo) => s.id));
      const next = [...prev];

      for (const song of songs) {
        if (existing.has(song.id)) continue;

        next.push({ ...song, startSeconds: song.defaultStartSeconds });
        existing.add(song.id);
      }

      return next;
    });

    toast.success('노래 추가');
  };

  return (
    <div className='h-full w-full'>
      <nav className='pt-4 pl-6'>
        <GoBack className='text-md' href='/playlists'>
          플레이리스트 목록
        </GoBack>
      </nav>

      <div className='m-auto flex w-full max-w-3xl flex-col items-center p-6'>
        <div className='flex w-full flex-col gap-6'>
          <h1 className='mb-2 text-center text-3xl font-bold'>플레이리스트 추가</h1>

          <InputField required label='플레이리스트 제목' value={name} onChange={(v) => setName(v)} />

          <SongGuideSection />

          <SongFormSection onAddSong={addSongToList} />

          <SongListSection
            songList={songList}
            onChangeSong={handleSongChange}
            onRemoveSong={handleRemoveSong}
            onAddSearchSong={addSearchSong}
          />

          <Button className='w-full self-center md:w-[25%]' size='lg' onClick={createPlaylist}>
            플레이리스트 추가
          </Button>
        </div>
      </div>
    </div>
  );
}
