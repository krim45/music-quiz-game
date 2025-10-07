import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from '@/app';
import { registerSocketHandlers } from '@/sockets';

const PORT = Number(process.env.PORT);
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, credentials: true },
});

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);
  registerSocketHandlers(io, socket);

  socket.on('disconnect', (reason) => {
    console.log(`[socket] disconnected: ${socket.id} (${reason})`);
  });
});

server.listen(PORT, () => {
  console.log(`HTTP+Socket listening on http://localhost:${PORT}`);
});
