import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authorize } from '../middleware/auth.js';

export const ownerRouter = Router();

ownerRouter.use(authorize('OWNER'));

ownerRouter.get('/dashboard', async (req, res, next) => {
  try {
    const [[store]] = await pool.execute(
      `SELECT s.id, s.name, ROUND(AVG(r.rating), 2) AS averageRating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [req.user.id]
    );

    if (!store) {
      return res.json({ store: null, ratings: [] });
    }

    const [ratings] = await pool.execute(
      `SELECT u.name, u.email, u.address, r.rating, r.updated_at AS ratedAt
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({ store, ratings });
  } catch (error) {
    next(error);
  }
});
