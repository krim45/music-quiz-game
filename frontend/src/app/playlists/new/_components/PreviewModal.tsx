'use client';

import { useEffect, useCallback } from 'react';
import { toast } from '@/lib/store/useToastStore';
import { validatePreview } from '@/app/playlists/new/_utils/validateSongInfo';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import Modal from '@/components/overlay/Modal';
import type { SongInfo } from '@/services/songs/types';

interface Props {
  open: boolean;
  onClose: () => void;
  songInfo: SongInfo;
}

export default function PreviewModal({ open, onClose, songInfo }: Props) {
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
      player?.stopVideo();
    };
  }, [open, isReady, songInfo, loadPreview, playerRef]);

  return (
    <Modal className='!h-auto rounded-4xl !p-0' width={640} open={open} onClose={onClose} showCloseButton={false}>
      <div className='aspect-video w-full bg-black'>
        <div id='preview_popup' />
      </div>
    </Modal>
  );
}
