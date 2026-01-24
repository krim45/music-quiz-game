import express, { Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import * as cookie from 'cookie';

import { isAllowedOrigin } from '@/config/cors';
import songsRouter from '@/routers/songs';
import playlistsRouter from '@/routers/playlists';

const isProd = process.env.NODE_ENV === 'production';

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
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/songs', songsRouter);

app.use('/playlists', playlistsRouter);

app.get('/session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const cookies = cookie.parse(req.headers.cookie ?? '');
  let sid = cookies.sid;

  if (!sid) {
    sid = crypto.randomUUID();

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('sid', sid, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax', // Vercel↔Fly 크로스사이트
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30일
      })
    );
  }

  res.json({ ok: true });
});

export default app;
