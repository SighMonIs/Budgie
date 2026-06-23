import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM payees ORDER BY id').all());
});

router.post('/', (req, res) => {
  const { name, bsb, number, reference } = req.body;
  const result = getDb().prepare('INSERT INTO payees (name, bsb, number, reference) VALUES (?, ?, ?, ?)').run(name, bsb ?? null, number ?? null, reference ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, bsb, number, reference } = req.body;
  getDb().prepare('UPDATE payees SET name=?, bsb=?, number=?, reference=? WHERE id=?').run(name, bsb ?? null, number ?? null, reference ?? null, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM payees WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
