import { Server, type Socket } from 'socket.io';
import { RoomManager } from '@/sockets/RoomManager';
import { registerRoomHandlers } from '@/sockets/room';
import type { Server as HttpServer } from 'http';

const CORS_ORIGIN = process.env.CORS_ORIGIN;

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, credentials: true },
  });

  const roomManager = new RoomManager();

  io.on('connection', (socket: Socket) => {
    registerRoomHandlers(io, socket, roomManager);
  });

  return io;
}
