'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/store/useToastStore';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useSongForm } from '@/app/playlists/new/_hooks/useSongForm';
import { createPlaylistClient } from '@/services/playlists/client';

import SongGuideSection from '@/app/playlists/new/_components/SongGuideSection';
import SongFormSection from '@/app/playlists/new/_components/SongFormSection';
import SongListSection from '@/app/playlists/new/_components/SongListSection';
import Button from '@/components/button/Button';
import GoBack from '@/components/nav/GoBack';
import InputField from '@/components/form/input/InputField';

import type { SongInfo, SongItem } from '@/services/songs/types';

export default function PlaylistPage() {
  const [name, setName] = useState<string>('');

  const { playerRef } = useYouTubePlayer('preview', { width: '100%', height: '100%' });
  // TODO: useSongForm 훅만 따로 쓰는 구조가 조금 이상함 SongFormSection 안에서 처리해도 될거같음, 사실 위에서 필요한거 songList하나뿐임. 구조 개선 가능해보임
  const {
    songInfo,
    songList,
    showPreview,
    updateSongInfo,
    loadPreview,
    addSong,
    setSongList,
    handleSongChange,
    handleRemoveSong,
  } = useSongForm(playerRef);

  const router = useRouter();

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

      for (const s of songs) {
        if (existing.has(s.id)) continue;

        next.push(s);
        existing.add(s.id);
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

          <SongFormSection
            songInfo={songInfo}
            showPreview={showPreview}
            onChange={updateSongInfo}
            onLoadPreview={loadPreview}
            onAddSong={addSong}
          />

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
