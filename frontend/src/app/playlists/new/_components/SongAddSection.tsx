'use client';

import { useState, useSyncExternalStore } from 'react';
import { pauseAllPlayers } from '@/lib/youtube/playerRegistry';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';

import Button from '@/components/button/Button';
import Modal from '@/components/overlay/Modal';
import SegmentedControl, { type SegmentOption } from '@/components/segment/SegmentedControl';
import SongGuideSection from '@/app/playlists/new/_components/SongGuideSection';
import SongFormSection from '@/app/playlists/new/_components/SongFormSection';
import TimestampImportSection from '@/app/playlists/new/_components/TimestampImportSection';

import type { SongInfo } from '@/services/songs/types';

export type SongAddMode = 'timestamp' | 'single';

// 여러 곡을 한 번에 넣는 쪽이 플레이리스트를 채우기에 빠르므로 먼저 둔다
const MODES: SegmentOption<SongAddMode>[] = [
  { value: 'timestamp', label: '타임스탬프로 여러 곡', panelId: 'song-add-timestamp' },
  { value: 'single', label: '한 곡씩', panelId: 'song-add-single' },
];

const MODE_LABEL: Record<SongAddMode, string> = { timestamp: '타임스탬프로 여러 곡', single: '한 곡씩' };

const GUIDE_SEEN_KEY = 'hasSeenSongAddGuide';

/**
 * 가이드를 본 적이 있는지. localStorage는 서버에서 읽을 수 없으므로
 * 서버 렌더에서는 "봤다"로 두어 모달 없이 그리고, 브라우저에서 실제 값으로 바꾼다.
 * 여기서 값을 바꾸는 쪽은 이 컴포넌트뿐이라 구독할 외부 변경은 없다.
 */
const subscribeNothing = () => () => {};
const readGuideSeen = () => getLocalStorageItem<boolean>(GUIDE_SEEN_KEY) === true;
const readGuideSeenOnServer = () => true;

interface Props {
  onAddSong: (song: SongInfo) => void;
  onAddSongs: (songs: SongInfo[]) => void;
}

/**
 * 새 곡을 만드는 두 방식을 한 자리에서 고른다.
 *
 * 두 입력 영역은 늘 띄워 두고 안 보이는 쪽만 숨긴다.
 * 방식을 바꿔도 입력하던 값이 남아 있어야 오가며 비교하거나 이어서 쓸 수 있다.
 * (이미 있는 곡을 고르는 "노래 검색"은 성격이 달라 노래 목록 쪽에 둔다)
 *
 * 가이드는 처음 한 번만 모달로 띄우고, 그 뒤로는 버튼으로 다시 열 때만 보인다.
 */
export default function SongAddSection({ onAddSong, onAddSongs }: Props) {
  const [mode, setMode] = useState<SongAddMode>('timestamp');

  const guideSeen = useSyncExternalStore(subscribeNothing, readGuideSeen, readGuideSeenOnServer);
  // 저장된 값은 구독하지 않으므로, 이번 방문에서 닫은 것은 따로 기억한다
  const [guideDismissed, setGuideDismissed] = useState(false);
  const [guideReopened, setGuideReopened] = useState(false);

  const isGuideOpen = guideReopened || (!guideSeen && !guideDismissed);

  const closeGuide = () => {
    setLocalStorageItem(GUIDE_SEEN_KEY, true);
    setGuideDismissed(true);
    setGuideReopened(false);
  };

  const changeMode = (next: SongAddMode) => {
    if (next === mode) return;

    // 숨겨진 쪽의 미리보기가 계속 소리를 내지 않도록 멈춘다. 입력값과 재생 위치는 그대로 둔다
    pauseAllPlayers();
    setMode(next);
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <SegmentedControl
          className='min-w-0 flex-1'
          ariaLabel='곡 추가 방식'
          options={MODES}
          value={mode}
          onChange={changeMode}
        />

        <Button className='shrink-0' color='gray' onClick={() => setGuideReopened(true)}>
          가이드
        </Button>
      </div>

      <div id='song-add-timestamp' role='tabpanel' className='flex flex-col gap-6' hidden={mode !== 'timestamp'}>
        <TimestampImportSection onAdd={onAddSongs} />
      </div>

      <div id='song-add-single' role='tabpanel' className='flex flex-col gap-6' hidden={mode !== 'single'}>
        <SongFormSection onAddSong={onAddSong} />
      </div>

      <Modal
        open={isGuideOpen}
        onClose={closeGuide}
        title={`곡 추가 가이드 · ${MODE_LABEL[mode]}`}
        width={640}
        height='auto'
      >
        <div className='flex flex-col gap-4'>
          <SongGuideSection mode={mode} />

          <Button className='self-end' color='green' onClick={closeGuide}>
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
}
