import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { category } = req.query;
  const query = category
    ? db.prepare('SELECT * FROM bills WHERE category = ? ORDER BY id')
    : db.prepare('SELECT * FROM bills ORDER BY category, id');
  res.json(category ? query.all(category) : query.all());
});

router.post('/', (req, res) => {
  const db = getDb();
  const { category, name, amount, frequency, due_day, due_date, account_id, payee_id, method, notes, goal_target, goal_saved, goal_deadline } = req.body;
  const result = db.prepare(`
    INSERT INTO bills (category, name, amount, frequency, due_day, due_date, account_id, payee_id, method, notes, goal_target, goal_saved, goal_deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(category, name, amount, frequency, due_day ?? null, due_date ?? null, account_id ?? null, payee_id ?? null, method ?? 'auto', notes ?? null, goal_target ?? null, goal_saved ?? null, goal_deadline ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { category, name, amount, frequency, due_day, due_date, account_id, payee_id, method, notes, goal_target, goal_saved, goal_deadline } = req.body;
  db.prepare(`
    UPDATE bills SET category=?, name=?, amount=?, frequency=?, due_day=?, due_date=?, account_id=?, payee_id=?, method=?, notes=?, goal_target=?, goal_saved=?, goal_deadline=?
    WHERE id=?
  `).run(category, name, amount, frequency, due_day ?? null, due_date ?? null, account_id ?? null, payee_id ?? null, method ?? 'auto', notes ?? null, goal_target ?? null, goal_saved ?? null, goal_deadline ?? null, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Payment history
router.get('/:id/payments', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM bill_payments WHERE bill_id=? ORDER BY paid_date DESC, id DESC').all(req.params.id));
});

router.post('/:id/payments', (req, res) => {
  const db = getDb();
  const { amount, paid_date, note } = req.body;
  const result = db.prepare('INSERT INTO bill_payments (bill_id, amount, paid_date, note) VALUES (?,?,?,?)')
    .run(req.params.id, amount, paid_date ?? null, note ?? null);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id/payments/:pid', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM bill_payments WHERE id=? AND bill_id=?').run(req.params.pid, req.params.id);
  res.json({ ok: true });
});

export default router;
