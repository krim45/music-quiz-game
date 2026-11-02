'use client';

import { useEffect, useRef, useState, RefObject } from 'react';
import { pauseOtherPlayers, registerPlayer, unregisterPlayer } from '@/lib/youtube/playerRegistry';

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
            registerPlayer(containerId, event.target);
            setIsReady(true);
            options.events?.onReady?.(event);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) pauseOtherPlayers(containerId);
            options.events?.onStateChange?.(event);
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
      const player = playerRef.current;
      playerRef.current = null;
      unregisterPlayer(containerId);

      // 언마운트 시 React가 iframe을 먼저 제거하므로, 여기 도달했을 때는
      // 플레이어가 가리키던 DOM이 이미 없을 수 있다. 그 상태로 destroy를 부르면
      // YouTube API가 iframe의 src를 읽다가 터진다(모달 딤 클릭 시 흰 화면).
      // 정리 실패는 무시해도 된다 — 어차피 노드가 사라진 뒤다.
      try {
        player?.destroy?.();
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[useYouTubePlayer] destroy 실패(무시)', e);
        }
      }

      // containerId가 바뀌어 플레이어를 다시 만드는 경우를 위한 초기화다.
      // 언마운트 시에는 no-op이고, 현재 호출부는 모두 고정 id라 실행되지 않는다.
      setIsReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- options: mount snapshot only
  }, [containerId]);

  return { playerRef, isReady };
};
