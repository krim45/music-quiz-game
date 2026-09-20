import { Router, Response } from 'express';
import { createPlaylist, deletePlaylist, getPlaylistDetail, getPlaylists } from '@/services/playlists';
import { HttpError } from '@/errors/HttpError';
import { adminOnly } from '@/middlewares/adminOnly';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // addedCount/failed를 빠뜨리면 유효하지 않은 링크가 섞여 있어도
    // 사용자가 알 방법이 없다. 프론트 CreatePlaylistResponse가 이 둘을 기대한다.
    const { playlist, addedCount, failed } = await createPlaylist(req.body);

    return res.status(201).json({ ok: true, playlist, addedCount, failed });
  } catch (e) {
    handleError(e, res);
  }
});

router.get('/', async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? '').trim();
    const q = qRaw || undefined;

    const limitRaw = Number(req.query.limit ?? 50);
    const offsetRaw = Number(req.query.offset ?? 0);

    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    const { playlists, hasMore } = await getPlaylists({ q, limit, offset });

    return res.json({
      ok: true,
      q: qRaw || null,
      limit,
      offset,
      hasMore,
      playlists,
    });
  } catch (e) {
    handleError(e, res);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { playlist, songs } = await getPlaylistDetail(String(req.params.id));

    // 내부 PlaylistItem은 게임 로직과 공유하느라 songId를 쓰지만,
    // REST에서는 곡 목록 API(/songs)와 같은 이름인 id로 내보낸다.
    res.json({
      ok: true,
      playlist,
      songs: songs.map(({ songId, ...rest }) => ({ id: songId, ...rest })),
    });
  } catch (e) {
    handleError(e, res);
  }
});

// router.patch('/:id', async (req: Request<{ id: string }, {}, UpdatePlaylistBody>, res: Response) => {
//   try {
//     const playlist = await updatePlaylist(req.params.id, req.body);
//     res.json({ ok: true, playlist });
//   } catch (e) {
//     handleError(e, res);
//   }
// });

router.delete('/:playlistId', adminOnly, async (req, res, next) => {
  try {
    const result = await deletePlaylist(String(req.params.playlistId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// router.post('/:id/songs', async (req: Request<{ id: string }, {}, AddSongsBody>, res: Response) => {
//   try {
//     const { songId, songIds } = req.body;
//     const ids = songIds ?? (songId ? [songId] : []);

//     if (ids.length === 0) {
//       return res.status(400).json({ ok: false, message: 'songId or songIds required' });
//     }

//     const result = await addSongsToPlaylist(req.params.id, ids);
//     res.status(201).json({ ok: true, ...result });
//   } catch (e) {
//     handleError(e, res);
//   }
// });

// router.delete('/:id/songs/:songId', async (req, res) => {
//   try {
//     const result = await removeSongFromPlaylist(req.params.id, req.params.songId);
//     res.json({ ok: true, ...result });
//   } catch (e) {
//     handleError(e, res);
//   }
// });

// TODO: 이거는 공용으로 써야하나?
function handleError(error: unknown, res: Response) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ ok: false, message: error.message });
  }

  console.error(error);
  return res.status(500).json({ ok: false, message: 'internal error' });
}

export default router;
