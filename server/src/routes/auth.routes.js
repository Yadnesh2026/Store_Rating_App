import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema, signupSchema, updatePasswordSchema, validate } from '../utils/validators.js';

export const authRouter = Router();

function signUser(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '1d' }
  );
}

authRouter.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, address, 'USER']
    );
    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    next(error);
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [req.body.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, address: user.address, role: user.role };
    res.json({ token: signUser(safeUser), user: safeUser });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, address, role FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

authRouter.put('/password', authenticate, validate(updatePasswordSchema), async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(req.body.newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (error) {
    next(error);
  }
});
