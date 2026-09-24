/**
 * 곡 관련 REST 계약.
 *
 * 백엔드의 `SongListItem`(backend/src/services/songs.ts)과 형태가 같아야 한다.
 * 아직 @music-quiz/shared 로 옮기지 않아 수동으로 맞춰야 하니, 백엔드를 고치면 여기도 고칠 것.
 */

export type SongItem = {
  id: string;
  title: string;
  singer: string;
  /** 제목 외에 정답으로 인정할 표기들 */
  extraAnswers: string[];
  /** 영상에서 이 곡이 시작하는 지점(초) */
  startSeconds: number;
  endSeconds: number | null;

  // 원본 영상 정보 (영상 하나에 곡이 여러 개 달릴 수 있다)
  provider: 'youtube';
  externalId: string;
  url: string;
};

export type SongsResponse = {
  ok: boolean;
  q: string | null;
  limit: number;
  offset: number;
  hasMore: boolean;
  items: SongItem[];
  message?: string;
};

/**
 * 화면에서 편집 중인 곡 한 줄.
 *
 * 추가 정답을 쉼표 문자열로 들고 있다 — 목록에서 그대로 입력·수정하기 위해서다.
 * 서버로 보낼 때 toSongPayload()로 배열 형태(SongPayload)로 바꾼다.
 */
export type SongInfo = {
  /** 검색으로 담은 기존 곡이면 그 id. 새로 만드는 곡이면 없다. */
  songId?: string;
  url: string;
  startSeconds?: number;
  endSeconds?: number | null;
  singer: string;
  title: string;
  extraAnswers: string[];
  _edit?: string;
  _preview?: string;
};

/** 실제로 서버에 보내는 형태 */
export type SongPayload = {
  songId?: string;
  url: string;
  startSeconds?: number;
  endSeconds?: number | null;
  singer: string;
  title: string;
  extraAnswers: string[];
};

/** 폼 입력값. 사용자는 문자열로 입력하고 제출 직전에 SongInfo로 바꾼다. */
export type SongFormState = {
  url: string;
  startSeconds: string;
  singer: string;
  title: string;
  extraAnswers: string[];
};
