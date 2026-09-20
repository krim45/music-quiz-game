/**
 * 채팅 계약.
 * `chat:message`는 방향에 따라 형태가 다르다 —
 * 보낼 때는 ChatSendPayload, 받을 때는 ChatMessage 유니온.
 */

/** client -> server */
export type ChatSendPayload = {
  roomId: string;
  message: string;
};

/** 시스템 메시지의 세부 종류. 입장/퇴장 알림에는 붙지 않는다. */
export type SystemChatType = 'correct' | 'skip' | 'timeout';

export type UserChatMessage = {
  type: 'user';
  from: string;
  color: string;
  message: string;
};

export type SystemChatMessage = {
  type: 'system';
  message: string;
  /**
   * 입장/퇴장 알림은 이 필드 없이 전송된다.
   * (backend/src/sockets/room.ts의 join/leave 핸들러 참고)
   */
  systemType?: SystemChatType;
  color?: string;
};

export type SummaryChatMessage = {
  type: 'summary';
  players: {
    nickname: string;
    color: string;
    score: number;
  }[];
};

/** server -> client */
export type ChatMessage = UserChatMessage | SystemChatMessage | SummaryChatMessage;

/** 서버가 `type`을 붙이기 전에 다루는 내부 페이로드 */
export type SystemChatPayload = Omit<SystemChatMessage, 'type'>;
export type SummaryChatPayload = Omit<SummaryChatMessage, 'type'>;
