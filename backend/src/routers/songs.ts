import { Router } from 'express';
import { findSongs } from '@/services/songs';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const qRaw = String(req.query.q ?? '').trim();
    const q = qRaw || undefined;

    const limitRaw = Number(req.query.limit ?? 50);
    const offsetRaw = Number(req.query.offset ?? 0);

    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    const { items, hasMore } = await findSongs({ q, limit, offset });

    return res.json({
      ok: true,
      q: qRaw || null,
      limit,
      offset,
      hasMore,
      items,
    });
  } catch (e) {
    console.error('[GET /songs] error', e);
    return res.status(500).json({ ok: false, message: 'songs 조회 중 오류' });
  }
});

export default router;
