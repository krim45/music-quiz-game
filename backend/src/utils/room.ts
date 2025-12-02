import { Room } from '@/types';
import { Server, Socket } from 'socket.io';

export const randomRoomCode = (length = 6) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
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

export const reassignOwner = (room: Room) => {
  // 방장 존재하는지 확인
  const hasOwner = Array.from(room.players.values()).some((p) => p.isOwner);
  if (hasOwner) return;

  // 방장이 없다면 첫 번째 플레이어를 방장으로 지정
  const iterator = room.players.values();
  const first = iterator.next().value;

  if (first) {
    first.isOwner = true;
    room.players.set(first.id, first);
  }
};
