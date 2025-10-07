import type { Server, Socket } from 'socket.io';
import { registerRoomHandlers } from '@/sockets/room';

export function registerSocketHandlers(io: Server, socket: Socket) {
  registerRoomHandlers(io, socket);
}
