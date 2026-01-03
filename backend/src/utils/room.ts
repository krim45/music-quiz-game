import { Room, RoomListItemDTO } from '@/types';

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

export const toRoomInfoDTO = (roomId: string, room: Room): RoomListItemDTO => ({
  roomId,
  title: room.title,
  curPlayers: room.players.size,
  maxPlayers: room.maxPlayers,
  hasPassword: !!room.password,
  status: room.status,
});
