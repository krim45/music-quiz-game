/**
 * 프론트엔드 전용 뷰 모델.
 *
 * 서버와 주고받는 타입(소켓 페이로드, DTO)은 여기 두지 않는다 —
 * `@music-quiz/shared`에서 직접 import 할 것.
 * 그래야 서버가 계약을 바꿨을 때 빌드가 깨져서 즉시 알 수 있다.
 */

import type { Player, RoomStatus } from '@music-quiz/shared';

/** YouTube 플레이어에 넘기는 현재 곡 상태 (가수명은 힌트 공개 후 채워짐) */
export type CurrentSong = {
  externalId: string;
  startSeconds: number;
  endSeconds?: number;
  singer: string;
};

/** `room:update`를 받아 클라이언트가 보관하는 방 상태 */
export type RoomRuntime = {
  status: RoomStatus;
  currentSongIndex: number;
  players: Player[];
};
