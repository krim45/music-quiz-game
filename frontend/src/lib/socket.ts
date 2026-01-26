import { io, type Socket } from 'socket.io-client';
import { getLocalStorageItem, setLocalStorageItem } from '@/utils/localStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const RECONNECT_DELAY_MS = 3000;
const RECONNECT_ATTEMPTS = 5;

let socket: Socket | null = null;
let fixing: Promise<void> | null = null;

async function ensureSessionOnce(): Promise<void> {
  if (!fixing) {
    fixing = fetch(`${API_URL}/session`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('session failed');
        }

        const data = await res.json();
        setLocalStorageItem('token', data.token);
      })
      .finally(() => {
        fixing = null;
      });
  }
  return fixing;
}

export function getSocket(): Socket {
  if (socket) return socket;

  const token = getLocalStorageItem('token');

  socket = io(API_URL, {
    transports: ['polling', 'websocket'],
    autoConnect: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: RECONNECT_ATTEMPTS,
    reconnectionDelay: RECONNECT_DELAY_MS,
  });

  socket.on('connect_error', async (err: Error) => {
    console.log('connect_error: ', err);

    if (err.message === 'SESSION_REQUIRED') {
      try {
        await ensureSessionOnce();
        const newToken = getLocalStorageItem('token');
        socket!.auth = { token: newToken };
        socket!.connect();
      } catch {
        socket?.disconnect();
      }
    }
  });

  return socket;
}
