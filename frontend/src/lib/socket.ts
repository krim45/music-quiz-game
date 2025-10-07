import { io, Socket } from 'socket.io-client';

const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081', {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
