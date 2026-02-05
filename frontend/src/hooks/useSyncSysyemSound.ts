'use client';

import { useEffect } from 'react';
import { clamp01, setSystemSoundVolume } from '@/sounds/systemSound';

type Params = {
  isReady: boolean;
  volume: number;
  mute?: boolean;
};

export function useSyncSystemSound({ isReady, volume, mute }: Params) {
  useEffect(() => {
    if (!isReady) return;

    setSystemSoundVolume(clamp01(volume), mute);
  }, [isReady, volume, mute]);
}
