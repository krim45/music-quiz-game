import 'dotenv/config';
import http from 'http';
import app from '@/app';
import { createSocketServer } from '@/sockets';

const PORT = Number(process.env.PORT);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`HTTP+Socket listening on http://localhost:${PORT}`);
});

createSocketServer(server);
