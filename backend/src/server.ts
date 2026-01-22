import 'dotenv/config';
import 'reflect-metadata';
import http from 'http';
import app from '@/app';
import { createSocketServer } from '@/sockets';
import { AppDataSource } from '@/db/AppDataSource';

AppDataSource.initialize()
  .then(() => {
    console.log('DB initialized');

    const PORT = Number(process.env.PORT) || 8081;

    const server = http.createServer(app);

    createSocketServer(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`HTTP+Socket listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB init error', err);
  });
