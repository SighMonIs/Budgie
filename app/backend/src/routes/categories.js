import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM categories ORDER BY id').all());
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
