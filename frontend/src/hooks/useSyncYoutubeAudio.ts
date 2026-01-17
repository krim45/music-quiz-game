'use client';

import { RefObject, useCallback, useEffect } from 'react';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const toYT = (v01: number) => Math.round(clamp01(v01) * 100);

type Params = {
  playerRef: RefObject<YT.Player | null>;
  isReady: boolean;
  volume: number;
  mute?: boolean;
};

export function useSyncYoutubeAudio({ playerRef, isReady, volume, mute }: Params) {
  const apply = useCallback(() => {
    const p = playerRef.current;
    if (!isReady || !p) return;

    const v = clamp01(volume);

    const shouldMute = mute || v <= 0.0001;

    if (shouldMute) {
      p.mute?.();
      // mute 상태에서도 볼륨은 맞춰두면 unmute 시 일관됨
      p.setVolume?.(toYT(v));
      return;
    }

    p.unMute?.();
    p.setVolume?.(toYT(v));
  }, [isReady, playerRef, volume, mute]);

  useEffect(() => {
    apply();
  }, [apply]);
}
