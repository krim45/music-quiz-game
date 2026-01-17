import { PlaylistItem, Room, RoomListItemDTO } from '@/types';
import { RoomManager } from '@/sockets/RoomManager';

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
  const index = room.players.size; // 기존 플레이어 수 기준

  return COLORS[index % COLORS.length];
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

export const toRoomListItemDTO = (roomId: string, room: Room): RoomListItemDTO => ({
  roomId,
  title: room.title,
  curPlayers: room.players.size,
  maxPlayers: room.maxPlayers,
  hasPassword: !!room.password,
  status: room.status,
});

export function normalizeAnswer(input: string) {
  return input.replace(/\s+/g, '').trim().toLowerCase();
}

export function parseExtraAnswers(extraAnswers?: string | null): string[] {
  if (!extraAnswers) return [];

  return extraAnswers
    .split(/[,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isCorrect(message: string, song: PlaylistItem) {
  const guess = normalizeAnswer(message);
  if (!guess) return false;

  const accepted = [song.title, ...parseExtraAnswers(song.extraAnswers)];
  return accepted.some((ans) => normalizeAnswer(ans) === guess);
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
