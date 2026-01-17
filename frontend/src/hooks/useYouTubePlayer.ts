'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

export interface UseYouTubePlayerResult {
  playerRef: RefObject<YT.Player | null>;
  isReady: boolean;
}

export const useYouTubePlayer = (containerId: string, options: YT.PlayerOptions): UseYouTubePlayerResult => {
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const initPlayer = () => {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerId, {
        ...options,
        playerVars: {
          origin: window.location.origin,
          playsinline: 1,
          ...options.playerVars,
        },
        events: {
          ...options.events,
          onReady: (event: YT.PlayerEvent) => {
            setIsReady(true);
            options.events?.onReady?.(event);
          },
        },
      });
    };

    // YT API 로딩 여부
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        initPlayer();
      };

      // 스크립트 최초 로드
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.id = 'youtube-iframe-api';
        document.body.appendChild(tag);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerId]);

  return { playerRef, isReady };
};
