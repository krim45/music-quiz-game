import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useState } from 'react';
import { useSongForm } from '@/app/room/create/_hooks/useSongForm';

// component
import SongSearchModal from '@/app/playlist/_components/SongSearchModal';
import SongGuideSection from '@/app/playlist/_components/SongGuideSection';
import SongFormSection from '@/app/playlist/_components/SongFormSection';
import SongListSection from '@/app/playlist/_components/SongListSection';
import Button from '@/components/button/Button';

export default function PlaylistPage() {
  const [open, setOpen] = useState(false);

  const { playerRef } = useYouTubePlayer('preview', { width: '100%', height: '100%' });
  // TODO: useSongForm 훅만 따로 쓰는 구조가 조금 이상함 SongFormSection 안에서 처리해도 될거같음, 사실 위에서 필요한거 songList하나뿐임. 구조 개선 가능해보임
  const { songInfo, songList, showPreview, updateSongInfo, loadPreview, addSong, handleSongChange, handleRemoveSong } =
    useSongForm(playerRef);

  return (
    <>
      <div className='m-auto flex w-full max-w-5xl flex-col items-center gap-7 p-6'>
        <div className='flex w-full flex-col gap-5'>
          <div className='flex justify-between'>
            <h2 className='text-2xl font-bold'>노래 추가</h2>

            <Button onClick={() => setOpen((prev) => !prev)}>노래 검색</Button>
          </div>

          <SongGuideSection />

          <SongFormSection
            songInfo={songInfo}
            showPreview={showPreview}
            onChange={updateSongInfo}
            onLoadPreview={loadPreview}
            onAddSong={addSong}
          />

          <SongListSection songList={songList} onChangeSong={handleSongChange} onRemoveSong={handleRemoveSong} />
        </div>
      </div>

      {/* TODO: 노래 추가 로직 넣기, 관련 로직 추가하고 위에 TODO 도 같이 처리 */}
      <SongSearchModal open={open} onClose={() => setOpen(false)} onAdd={() => {}} />
    </>
  );
}
