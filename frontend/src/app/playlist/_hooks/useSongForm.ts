'use client';

import { useState } from 'react';
import { toast } from '@/lib/store/useToastStore';
import { validatePreview, validateSongInfo } from '@/app/playlist/_utils/validateSongInfo';

import type { SongInfo } from '@/app/services/songs/types';

export function useSongForm(playerRef: React.RefObject<YT.Player | null>) {
  const [songInfo, setSongInfo] = useState<SongInfo>({ url: '', singer: '', title: '' });
  const [songList, setSongList] = useState<SongInfo[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const updateSongInfo = (key: keyof SongInfo, value: SongInfo[keyof SongInfo]) => {
    setSongInfo((prev) => ({ ...prev, [key]: value }));
  };

  const loadPreview = () => {
    const result = validatePreview(songInfo);
    if (!result.ok) return toast.error(result.error);

    setShowPreview(true);
    playerRef.current?.loadVideoById({
      videoId: result.videoId,
      startSeconds: result.startSeconds,
      endSeconds: result.startSeconds + 60,
    });
  };

  const addSong = () => {
    const error = validateSongInfo(songInfo);
    if (error) return toast.error(error);

    setSongList((prev) => [...prev, songInfo]);
    setSongInfo({ url: '', singer: '', title: '' });

    setShowPreview(false);
    playerRef.current?.stopVideo?.();
    toast.info('노래가 추가되었습니다!');
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

  return {
    songInfo,
    songList,
    showPreview,
    updateSongInfo,
    loadPreview,
    addSong,
    setSongList,
    handleSongChange,
    handleRemoveSong,
  };
}
