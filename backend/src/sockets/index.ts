import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import * as cookie from 'cookie';

import { RoomManager } from '@/sockets/RoomManager';
import { registerRoomHandlers } from '@/sockets/room';
import { isAllowedOrigin } from '@/config/cors';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin(origin, cb) {
        if (isAllowedOrigin(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    },
  });

  const roomManager = new RoomManager();

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.request.headers.cookie ?? '');
    const sid = cookies.sid;

    if (!sid) {
      return next(new Error('SESSION_REQUIRED'));
    }

    socket.data.sid = sid;
    next();
  });

  io.on('connection', (socket: Socket) => {
    registerRoomHandlers(io, socket, roomManager);
  });

  return io;
}
