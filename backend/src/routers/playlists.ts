import { Router, Request, Response } from 'express';
import {
  addSongsToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistDetail,
  listPlaylists,
  removeSongFromPlaylist,
  updatePlaylist,
} from '@/services/playlists';
import { HttpError } from '@/errors/HttpError';

export interface CreatePlaylistBody {
  name: string;
  description?: string | null;
}

export interface UpdatePlaylistBody {
  name?: string;
  description?: string | null;
}

export interface AddSongsBody {
  songId?: string;
  songIds?: string[];
}

const router = Router();

router.post('/', async (req: Request<{}, {}, CreatePlaylistBody>, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ ok: false, message: 'name is required' });
    }

    const playlist = await createPlaylist({
      name: name.trim(),
      description,
    });

    return res.status(201).json({ ok: true, playlist });
  } catch (e) {
    handleError(e, res);
  }
});

router.get('/', async (_req, res) => {
  try {
    const playlists = await listPlaylists();
    res.json({ ok: true, playlists });
  } catch (e) {
    handleError(e, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const detail = await getPlaylistDetail(req.params.id);
    res.json({ ok: true, ...detail });
  } catch (e) {
    handleError(e, res);
  }
});

router.patch('/:id', async (req: Request<{ id: string }, {}, UpdatePlaylistBody>, res: Response) => {
  try {
    const playlist = await updatePlaylist(req.params.id, req.body);
    res.json({ ok: true, playlist });
  } catch (e) {
    handleError(e, res);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await deletePlaylist(req.params.id);
    res.json({ ok: true, ...result });
  } catch (e) {
    handleError(e, res);
  }
});

router.post('/:id/songs', async (req: Request<{ id: string }, {}, AddSongsBody>, res: Response) => {
  try {
    const { songId, songIds } = req.body;
    const ids = songIds ?? (songId ? [songId] : []);

    if (ids.length === 0) {
      return res.status(400).json({ ok: false, message: 'songId or songIds required' });
    }

    const result = await addSongsToPlaylist(req.params.id, ids);
    res.status(201).json({ ok: true, ...result });
  } catch (e) {
    handleError(e, res);
  }
});

router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const result = await removeSongFromPlaylist(req.params.id, req.params.songId);
    res.json({ ok: true, ...result });
  } catch (e) {
    handleError(e, res);
  }
});

function handleError(error: unknown, res: Response) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ ok: false, message: error.message });
  }

  console.error(error);
  return res.status(500).json({ ok: false, message: 'internal error' });
}

export default router;
