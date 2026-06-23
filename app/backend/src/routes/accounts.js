import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM accounts ORDER BY id').all());
});

router.post('/', (req, res) => {
  const { name, bsb, number } = req.body;
  const result = getDb().prepare('INSERT INTO accounts (name, bsb, number) VALUES (?, ?, ?)').run(name, bsb ?? null, number ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, bsb, number } = req.body;
  getDb().prepare('UPDATE accounts SET name=?, bsb=?, number=? WHERE id=?').run(name, bsb ?? null, number ?? null, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM accounts WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
