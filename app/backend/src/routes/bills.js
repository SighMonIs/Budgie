import { Router } from 'express';
import { getDb } from '../db.js';
import { CATEGORIES, FREQUENCIES } from '../logic.js';

const router = Router();

// Validate + normalise the request body (shared by create and update)
function parseBill(body) {
  const { category, name, amount, frequency, due_day, notes, goal_target, goal_saved } = body ?? {};
  if (!CATEGORIES.includes(category)) return { error: 'invalid category' };
  if (!FREQUENCIES.includes(frequency)) return { error: 'invalid frequency' };
  if (typeof name !== 'string' || !name.trim()) return { error: 'name required' };
  if (!Number.isInteger(amount) || amount <= 0) return { error: 'amount must be a positive integer (cents)' };
  const isGoal = category === 'savings';
  return {
    values: [
      category, name.trim(), amount, frequency,
      isGoal ? null : (due_day || null),
      notes || null,
      isGoal ? (goal_target ?? null) : null,
      isGoal ? (goal_saved ?? null) : null,
    ],
  };
}

router.post('/', (req, res) => {
  const { error, values } = parseBill(req.body);
  if (error) return res.status(400).json({ error });
  const result = getDb().prepare(
    'INSERT INTO bills (category, name, amount, frequency, due_day, notes, goal_target, goal_saved) VALUES (?,?,?,?,?,?,?,?)'
  ).run(...values);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { error, values } = parseBill(req.body);
  if (error) return res.status(400).json({ error });
  getDb().prepare(
    'UPDATE bills SET category=?, name=?, amount=?, frequency=?, due_day=?, notes=?, goal_target=?, goal_saved=? WHERE id=?'
  ).run(...values, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  getDb().prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
