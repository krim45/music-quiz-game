import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let fixing: Promise<void> | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function ensureSessionOnce() {
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
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: true,
    });

    socket.on('connect_error', async (err: Error) => {
      if (err?.message === 'SESSION_REQUIRED') {
        await ensureSessionOnce();
        socket?.connect();
      }
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
}
