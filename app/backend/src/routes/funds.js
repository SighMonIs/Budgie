import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const { kind, amount, purpose, destination } = req.body;
  if (!['add', 'take'].includes(kind)) return res.status(400).json({ error: 'kind must be add or take' });
  if (!Number.isInteger(amount) || amount <= 0) return res.status(400).json({ error: 'amount must be a positive integer (cents)' });
  const result = getDb().prepare(
    'INSERT INTO fund_adjustments (kind, amount, purpose, destination) VALUES (?, ?, ?, ?)'
  ).run(kind, amount, purpose ?? null, destination ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM fund_adjustments ORDER BY created_at DESC').all());
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM fund_adjustments WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
