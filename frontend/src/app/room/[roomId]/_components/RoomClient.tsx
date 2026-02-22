'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { getSocket } from '@/lib/socket';
import { toast } from '@/lib/store/useToastStore';
import { pushEvent } from '@/lib/analytics';
import { playSystemSound } from '@/sounds/systemSound';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { usePreventRefresh } from '@/hooks/usePreventRefresh';
import { useRoomConnect } from '@/app/room/[roomId]/_hooks/useRoomConnect';

import LoadingDots from '@/components/feedback/LoadingDots';
import Header from '@/app/room/[roomId]/_components/Header';
import JoinSection from '@/app/room/[roomId]/_components/JoinSection';
import WaitingSection from '@/app/room/[roomId]/_components/WaitingSection';
import PlayingSection from '@/app/room/[roomId]/_components/PlayingSection';
import ChatRoom from '@/app/room/[roomId]/_components/ChatRoom';
import Button from '@/components/button/Button';

import type {
  ChatMessage,
  RoomInfo,
  RoomInfoResponse,
  RoomUpdateResponse,
  RoomRuntime,
  GameStart,
  GamePlay,
  GameHint,
  GameReveal,
  GameSkipUpdate,
} from '@/types/game';

export default function RoomPage() {
  const [joined, setJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [runtime, setRuntime] = useState<RoomRuntime | null>(null);

  const [startState, setStartState] = useState<GameStart | null>(null);
  const [playState, setPlayState] = useState<GamePlay | null>(null);
  const [hint, setHint] = useState<GameHint | null>(null);
  const [reveal, setReveal] = useState<GameReveal | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const router = useRouter();
  const params = useParams();
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId!;

  const started = runtime?.status === 'playing' || !!startState || !!playState;

  const { playerRef, isReady } = useYouTubePlayer('player', { width: '100%', height: '100%' });
  usePreventRefresh({ enabled: joined && started });
  useRoomConnect({ roomId });

  const shouldShowLoading = !isReady || isLoading;
  const shouldShowJoin = !shouldShowLoading && !joined;
  const shouldShowRoom = !shouldShowLoading && joined;

  const players = runtime?.players ?? [];

  useEffect(() => {
    if (!isReady) return;

    const socket = getSocket();

    const onRoomUpdate = (payload: RoomUpdateResponse) => {
      if (!payload) return;
      setRuntime({
        status: payload.status,
        currentSongIndex: payload.currentSongIndex,
        players: payload.players,
      });
    };

    const onChat = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.type === 'system' && msg.systemType !== 'skip') {
        playSystemSound(msg.systemType);
      }
    };

    const onGameStart = (payload: GameStart) => {
      if (!playerRef.current) {
        console.error('Player is not ready');
        return;
      }

      const { song, durationSec } = payload;
      const { externalId, startSeconds, endSeconds } = song;

      playerRef.current.cueVideoById({
        videoId: externalId,
        startSeconds,
        endSeconds: endSeconds ?? startSeconds + durationSec,
      });

      playSystemSound('countdown');
      setStartState(payload);
      setPlayState(null);
      setHint(null);
      setReveal(null);
    };

    const onGamePlay = (payload: GamePlay) => {
      if (!playerRef.current) {
        console.error('Player is not ready');
        return;
      }

      playerRef.current.playVideo();

      setPlayState(payload);
      setStartState(null);
      setHint(null);
      setReveal(null);
    };

    const onSkipUpdate = (payload: GameSkipUpdate) => {
      setPlayState((prev) => {
        if (!prev) return prev;
        if (prev.currentSongIndex !== payload.currentSongIndex) return prev;
        return { ...prev, skip: payload.skip };
      });
    };

    const onHint = (payload: GameHint) => {
      setHint((prev) => {
        if (!prev) return payload;
        if (prev.currentSongIndex !== payload.currentSongIndex) return payload;
        return payload;
      });
    };

    const onReveal = (payload: GameReveal) => {
      setReveal(payload);
    };

    const onGameFinished = () => {
      setPlayState(null);
      setStartState(null);
      setHint(null);
      setReveal(null);
      playerRef.current?.stopVideo?.();
      pushEvent({ event: 'complete_game' });
    };

    const onKicked = (payload: { roomId: string; message?: string }) => {
      toast.error(payload.message || '방에서 강퇴되었습니다.');
      router.push('/room/join');
    };

    socket.on('room:update', onRoomUpdate);
    socket.on('chat:message', onChat);
    socket.on('game:start', onGameStart);
    socket.on('game:play', onGamePlay);
    socket.on('game:skip:update', onSkipUpdate);
    socket.on('game:hint', onHint);
    socket.on('game:reveal', onReveal);
    socket.on('game:finished', onGameFinished);
    socket.on('room:kicked', onKicked);

    socket.emit('room:info', { roomId }, (res: RoomInfoResponse) => {
      if (!res.ok) {
        toast.error(res.message || '방 정보를 가져올 수 없습니다.');
        router.replace('/room/join');
        return;
      }
      setRoomInfo(res.data);
      setIsLoading(false);
    });

    return () => {
      socket.off('room:update', onRoomUpdate);
      socket.off('chat:message', onChat);
      socket.off('game:start', onGameStart);
      socket.off('game:play', onGamePlay);
      socket.off('game:skip:update', onSkipUpdate);
      socket.off('game:hint', onHint);
      socket.off('game:reveal', onReveal);
      socket.off('game:finished', onGameFinished);
      socket.off('room:kicked', onKicked);
    };
  }, [isReady, roomId]);

  const onJoined = () => {
    setJoined(true);
  };

  const onSendMessage = (message: string) => {
    const socket = getSocket();
    socket.emit('chat:message', { roomId, message });
  };

  const onSkip = () => {
    const socket = getSocket();

    socket.emit(
      'game:skip',
      { roomId, currentSongIndex: playState?.currentSongIndex },
      (res: { ok: boolean; message?: string }) => {
        if (!res.ok) {
          toast.error(res.message || '스킵 실패');
          return;
        }
      }
    );
  };

  const skip = playState?.skip ?? startState?.skip;
  const SkipButton = (
    <Button className='!px-2' type='button' size='sm' onClick={onSkip} disabled={!started}>
      {skip ? `스킵 ${skip.current}/${skip.required}` : '스킵'}
    </Button>
  );

  return (
    <div className='relative flex h-full w-full touch-pan-y flex-col items-center'>
      <div id='player' className='pointer-events-none absolute top-0 -left-[9999px] h-px w-px opacity-0' />

      <Header playerRef={playerRef} isReady={isReady} />

      {shouldShowLoading ? (
        <LoadingDots />
      ) : shouldShowJoin ? (
        <JoinSection
          roomId={roomId}
          title={roomInfo!.room.title}
          hasPassword={roomInfo!.room.hasPassword}
          playerRef={playerRef}
          onJoined={onJoined}
        />
      ) : shouldShowRoom ? (
        <div className='flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-3 px-6 pb-2'>
          <section className='flex flex-none basis-60 gap-3 overflow-hidden'>
            {started ? (
              <PlayingSection
                roomInfo={roomInfo!}
                runtime={runtime!}
                startState={startState}
                playState={playState}
                hint={hint}
                reveal={reveal}
              />
            ) : (
              <WaitingSection roomId={roomId} roomInfo={roomInfo!} players={players} />
            )}
          </section>

          <ChatRoom actions={SkipButton} messages={messages} onSendMessage={onSendMessage} />
        </div>
      ) : null}
    </div>
  );
}
