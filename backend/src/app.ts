import express, { Response } from 'express';
import cors from 'cors';
import songsRouter from '@/routers/songs';
import playlistsRouter from '@/routers/playlists';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
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

export default app;
