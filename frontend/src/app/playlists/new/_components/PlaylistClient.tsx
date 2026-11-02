'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/store/useToastStore';
import { createPlaylistClient } from '@/services/playlists/client';

import Button from '@/components/button/Button';
import GoBack from '@/components/nav/GoBack';
import InputField from '@/components/form/input/InputField';
import SongAddSection from '@/app/playlists/new/_components/SongAddSection';
import SongListSection from '@/app/playlists/new/_components/SongListSection';
import { toSongPayload } from '@/app/playlists/new/_utils/songForm';

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

    // 목록에서 시작 시간을 잘못 고친 곡. 그대로 보내면 이전 값이나 0초로 저장된다
    const invalidStart = songList.find((s) => s.startSeconds === null);
    if (invalidStart) return toast.error(`"${invalidStart.title}"의 시작 시간이 올바르지 않습니다.`);

    try {
      const res = await createPlaylistClient({ name: trimmed, songs: songList.map(toSongPayload) });

      // 일부 곡이 빠졌으면 알려준다. 그냥 "완료"만 띄우면
      // 유효하지 않은 링크가 조용히 사라져서 나중에야 눈치채게 된다.
      const failed = res.ok ? res.failed : [];
      if (failed.length > 0) {
        toast.error(
          `${res.ok ? res.addedCount : 0}곡 추가됨. ${failed.length}곡은 링크가 유효하지 않아 제외되었습니다.`
        );
      } else {
        toast.success(`플레이리스트 생성 완료 (${res.ok ? res.addedCount : 0}곡)`);
      }

      router.push('/room/new');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '플레이리스트 생성 실패');
    }
  };

  /**
   * 목록에 없는 곡만 골라 담고, 실제로 담긴 수를 돌려준다.
   * 부르는 쪽이 "몇 곡 담았는지"로 안내하고 입력을 비울지 정하므로, 걸러내기를
   * setState 업데이터 안이 아니라 여기서 먼저 한다. 업데이터 안에서 세면 그 결과를 바로 알 수 없다.
   */
  const appendNew = (songs: SongInfo[], keyOf: (song: SongInfo) => string | undefined): number => {
    const seen = new Set(songList.map(keyOf).filter(Boolean));
    const fresh = songs.filter((song) => {
      const key = keyOf(song);
      if (key === undefined) return true;
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    if (fresh.length > 0) setSongList((prev) => [...prev, ...fresh]);
    return fresh.length;
  };

  /** 타임스탬프로 만든 곡. 같은 영상의 같은 지점은 서버에서 한 곡으로 합쳐지므로 미리 걸러낸다 */
  const addSongs = (songs: SongInfo[]) => appendNew(songs, (s) => `${s.url}@${s.startSeconds ?? 0}`);

  /** 검색으로 고른 기존 곡. 같은 곡(songId)은 한 번만 담는다 */
  const addSearchSong = (songs: SongItem[]) =>
    appendNew(
      songs.map((song) => ({
        songId: song.id,
        url: song.url,
        singer: song.singer,
        title: song.title,
        startSeconds: song.startSeconds,
        endSeconds: song.endSeconds,
        extraAnswers: song.extraAnswers,
      })),
      (s) => s.songId
    );

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

          <SongAddSection onAddSong={addSongToList} onAddSongs={addSongs} />

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
