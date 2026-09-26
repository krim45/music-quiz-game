import { PlaylistItem, Room } from '@/types';
import type { RoomListItem } from '@music-quiz/shared';
import { RoomManager } from '@/sockets/RoomManager';
import { isAcceptedAnswer } from '@/utils/answer';

export const randomRoomCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const COLORS = ['red', 'blue', 'teal', 'purple', 'yellow', 'orange', 'green', 'brown', 'pink', 'white', 'gray', 'lime'];

export const assignColor = (room: Room): string => {
  const used = new Set(Array.from(room.players.values()).map((p) => p.color));
  const available = COLORS.filter((c) => !used.has(c));

  if (available.length > 0) return available[0];

  return COLORS[room.players.size % COLORS.length];
};

// 방장 위임
export const reassignOwner = (room: Room): void => {
  const players = [...room.players.values()];
  const hasOwner = players.some((p) => p.isOwner);
  if (hasOwner) return;

  const nextOwner = players.find((p) => p.socketId !== null) ?? players[0];
  if (!nextOwner) return;

  nextOwner.isOwner = true;
  room.players.set(nextOwner.playerId, nextOwner);
};

export const toRoomListItemDTO = (roomId: string, room: Room): RoomListItem => ({
  roomId,
  title: room.title,
  curPlayers: room.players.size,
  maxPlayers: room.maxPlayers,
  hasPassword: !!room.password,
  status: room.status,
});

/** 판정 규칙은 utils/answer.ts 와 docs/policy/answer-judging.md */
export function isCorrect(message: string, song: PlaylistItem) {
  return isAcceptedAnswer(message, [song.title, ...song.extraAnswers]);
}

export function getMe(RoomManager: RoomManager, roomId: string, socketId: string) {
  const room = RoomManager.get(roomId);
  if (!room) return { ok: false as const, message: '존재하지 않는 방입니다.' };

  const socketRoom = RoomManager.getSocketRoom(socketId);
  if (!socketRoom || socketRoom.roomId !== roomId) {
    return { ok: false as const, message: '방에 참여한 유저만 가능합니다.' };
  }

  const me = room.players.get(socketRoom.playerId);
  if (!me) return { ok: false as const, message: '플레이어 정보를 찾을 수 없습니다.' };

  return { ok: true as const, room, me, playerId: socketRoom.playerId };
}
