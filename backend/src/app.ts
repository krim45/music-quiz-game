import express, { Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { isAllowedOrigin } from '@/config/cors';
import songsRouter from '@/routers/songs';
import playlistsRouter from '@/routers/playlists';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_TTL = '30d';

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res: Response) => {
  res.json({ ok: true, uptime: process.uptime(), version: '1.0.0' });
});

app.use('/songs', songsRouter);

app.use('/playlists', playlistsRouter);

app.get('/session', (_, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const sid = crypto.randomUUID();
  const token = jwt.sign({ sid }, JWT_SECRET, { expiresIn: TOKEN_TTL });

  res.json({ ok: true, token });
});

export default app;
