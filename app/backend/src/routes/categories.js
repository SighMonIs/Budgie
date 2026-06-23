import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM categories ORDER BY sort_order, id').all());
});

router.patch('/:id/order', (req, res) => {
  const db = getDb();
  const { direction } = req.body;
  const all = db.prepare('SELECT id, sort_order FROM categories ORDER BY sort_order, id').all();
  const idx = all.findIndex(c => c.id === parseInt(req.params.id));
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return res.json({ ok: true });
  const a = all[idx], b = all[swapIdx];
  db.prepare('UPDATE categories SET sort_order=? WHERE id=?').run(b.sort_order ?? b.id, a.id);
  db.prepare('UPDATE categories SET sort_order=? WHERE id=?').run(a.sort_order ?? a.id, b.id);
  res.json({ ok: true });
});

router.post('/', (req, res) => {
  const { name, color, type } = req.body;
  const result = getDb().prepare('INSERT INTO categories (name, color, type) VALUES (?, ?, ?)').run(name, color, type ?? 'debit');
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, color, type } = req.body;
  getDb().prepare('UPDATE categories SET name=?, color=?, type=? WHERE id=?').run(name, color, type, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
