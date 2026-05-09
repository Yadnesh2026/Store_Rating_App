import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { storeRouter } from './routes/store.routes.js';
import { ownerRouter } from './routes/owner.routes.js';
import { authenticate } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/admin', authenticate, adminRouter);
app.use('/api/stores', authenticate, storeRouter);
app.use('/api/owner', authenticate, ownerRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
