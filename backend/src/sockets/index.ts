import { Server, type Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

import { RoomManager } from '@/sockets/RoomManager';
import { registerRoomHandlers } from '@/sockets/room';
import { isAllowedOrigin } from '@/config/cors';

const JWT_SECRET = process.env.JWT_SECRET!;

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin(origin, cb) {
        if (isAllowedOrigin(origin)) {
          return cb(null, true);
        }
        return cb(new Error(`Not allowed by CORS: ${origin}`));
      },
    },
  });

  const roomManager = new RoomManager();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('SESSION_REQUIRED'));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);

      if (typeof payload === 'string' || typeof payload.sid !== 'string') {
        return next(new Error('SESSION_REQUIRED'));
      }

      socket.data.sid = payload.sid;
      next();
    } catch {
      next(new Error('SESSION_REQUIRED'));
    }
  });

  io.on('connection', (socket: Socket) => {
    registerRoomHandlers(io, socket, roomManager);
  });

  return io;
}
