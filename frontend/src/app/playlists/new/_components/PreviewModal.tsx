'use client';

import { useEffect, useCallback } from 'react';
import { toast } from '@/lib/store/useToastStore';
import { validatePreview } from '@/app/playlists/new/_utils/validateSongInfo';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import Modal from '@/components/overlay/Modal';
import StartPicker from '@/app/playlists/new/_components/StartPicker';
import type { SongInfo } from '@/services/songs/types';

interface Props {
  open: boolean;
  onClose: () => void;
  songInfo: SongInfo;
  /**
   * 주면 "여기서 시작" 버튼이 붙는다.
   * 노래 검색처럼 듣기만 하면 되는 곳에서는 넘기지 않는다.
   */
  onPickStart?: (seconds: number) => void;
}

export default function PreviewModal({ open, onClose, songInfo, onPickStart }: Props) {
  const { playerRef, isReady } = useYouTubePlayer('preview_popup', { width: '100%', height: '100%' });

  const loadPreview = useCallback(
    (preview: SongInfo) => {
      if (!isReady || !playerRef.current) return;

      const result = validatePreview(preview);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      playerRef.current.loadVideoById({
        videoId: result.videoId,
        startSeconds: result.startSeconds,
        endSeconds: result.startSeconds + 60,
      });
    },
    [isReady, playerRef]
  );

  useEffect(() => {
    const player = playerRef.current;

    if (open && isReady) {
      loadPreview(songInfo);
    }

    return () => {
      // 모달이 닫히면 iframe이 먼저 사라진다. 같은 이유로 방어한다.
      try {
        player?.stopVideo?.();
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[PreviewModal] stopVideo 실패(무시)', e);
        }
      }
    };
  }, [open, isReady, songInfo, loadPreview, playerRef]);

  return (
    <Modal
      className='h-auto! rounded-4xl p-0!'
      width={640}
      open={open}
      onClose={onClose}
      showCloseButton={false}
      ariaLabel='노래 미리보기'
    >
      <div className='aspect-video w-full bg-black'>
        <div id='preview_popup' />
      </div>

      <div className='px-4 py-3'>
        <StartPicker playerRef={playerRef} active={open && isReady} onPick={onPickStart} />
      </div>
    </Modal>
  );
}
