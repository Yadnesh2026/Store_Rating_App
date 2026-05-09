import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { authorize } from '../middleware/auth.js';
import { createStoreSchema, createUserSchema, validate } from '../utils/validators.js';

export const adminRouter = Router();

adminRouter.use(authorize('ADMIN'));

const sortable = {
  name: 'name',
  email: 'email',
  address: 'address',
  role: 'role',
  rating: 'rating'
};

function sortClause(query, fallback = 'name') {
  const sortBy = sortable[query.sortBy] || fallback;
  const order = String(query.order || 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  return ` ORDER BY ${sortBy} ${order}`;
}

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const [[users]] = await pool.execute('SELECT COUNT(*) total FROM users');
    const [[stores]] = await pool.execute('SELECT COUNT(*) total FROM stores');
    const [[ratings]] = await pool.execute('SELECT COUNT(*) total FROM ratings');
    res.json({ users: users.total, stores: stores.total, ratings: ratings.total });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/users', validate(createUserSchema), async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address, role]
    );
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
    next(error);
  }
});

adminRouter.post('/stores', validate(createStoreSchema), async (req, res, next) => {
  try {
    const { name, email, address, ownerId = null } = req.body;
    await pool.execute('INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)', [
      name,
      email,
      address,
      ownerId
    ]);
    res.status(201).json({ message: 'Store created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Store email already exists' });
    next(error);
  }
});

adminRouter.get('/users', async (req, res, next) => {
  try {
    const filters = [];
    const values = [];
    for (const field of ['name', 'email', 'address', 'role']) {
      if (req.query[field]) {
        filters.push(`${field} LIKE ?`);
        values.push(`%${req.query[field]}%`);
      }
    }
    const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT id, name, email, address, role FROM users${where}${sortClause(req.query)}`,
      values
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/users/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.address, u.role,
        CASE WHEN u.role = 'OWNER' THEN ROUND(AVG(r.rating), 2) ELSE NULL END AS rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/stores', async (req, res, next) => {
  try {
    const filters = [];
    const values = [];
    for (const field of ['name', 'email', 'address']) {
      if (req.query[field]) {
        filters.push(`s.${field} LIKE ?`);
        values.push(`%${req.query[field]}%`);
      }
    }
    const where = filters.length ? ` WHERE ${filters.join(' AND ')}` : '';
    const [rows] = await pool.execute(
      `SELECT s.id, s.name, s.email, s.address, ROUND(AVG(r.rating), 2) AS rating
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       ${where}
       GROUP BY s.id${sortClause(req.query, 'name')}`,
      values
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});
