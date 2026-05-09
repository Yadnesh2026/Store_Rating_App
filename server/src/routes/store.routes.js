import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authorize } from '../middleware/auth.js';
import { ratingSchema, validate } from '../utils/validators.js';

export const storeRouter = Router();

storeRouter.get('/', authorize('USER'), async (req, res, next) => {
  try {
    const search = `%${req.query.search || ''}%`;
    const sortFields = { name: 's.name', address: 's.address', rating: 'overallRating' };
    const sortBy = sortFields[req.query.sortBy] || 's.name';
    const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.address, ROUND(AVG(r.rating), 2) AS overallRating,
        MAX(CASE WHEN r.user_id = ? THEN r.rating END) AS userRating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.name LIKE ? OR s.address LIKE ?
       GROUP BY s.id
       ORDER BY ${sortBy} ${order}`,
      [req.user.id, search, search]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

storeRouter.put('/:storeId/rating', authorize('USER'), validate(ratingSchema), async (req, res, next) => {
  try {
    await pool.execute(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [req.user.id, req.params.storeId, req.body.rating]
    );
    res.json({ message: 'Rating saved' });
  } catch (error) {
    next(error);
  }
});
