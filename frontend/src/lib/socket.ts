import { io, type Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const RECONNECT_DELAY_MS = 3000;
const RECONNECT_ATTEMPTS = 5;

let socket: Socket | null = null;
let fixing: Promise<void> | null = null;

async function ensureSessionOnce(): Promise<void> {
  if (!fixing) {
    fixing = fetch(`${API_URL}/session`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`session issue: ${res.status} ${res.statusText}`);
      })
      .finally(() => {
        fixing = null;
      });
  }
  return fixing;
}

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(API_URL, {
    transports: ['polling', 'websocket'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY_MS,
    reconnectionDelayMax: RECONNECT_DELAY_MS,
  });

  socket.on('connect_error', async (err: Error) => {
    console.error('connect_error', err);

    if (err.message === 'SESSION_REQUIRED') {
      try {
        await ensureSessionOnce();
        socket?.disconnect();
        socket?.connect();
      } catch (e) {
        console.error('ensureSessionOnce failed', e);
      }
    }
  });

  return socket;
}
