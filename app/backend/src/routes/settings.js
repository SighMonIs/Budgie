import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const s = db.prepare('SELECT * FROM settings WHERE id = 1').get();

  // Promote pending pay if its effective date has arrived
  if (s.pending_pay_amount && s.pending_pay_date) {
    const today = new Date().toISOString().slice(0, 10);
    if (today >= s.pending_pay_date) {
      db.prepare(`UPDATE settings SET pay_amount = ?, pending_pay_amount = NULL, pending_pay_date = NULL WHERE id = 1`)
        .run(s.pending_pay_amount);
      s.pay_amount = s.pending_pay_amount;
      s.pending_pay_amount = null;
      s.pending_pay_date = null;
    }
  }

  res.json(s);
});

router.put('/', (req, res) => {
  const db = getDb();
  const allowed = ['currency', 'pay_amount', 'pay_frequency', 'next_payday', 'theme', 'accent', 'pending_pay_amount', 'pending_pay_date'];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key}=?`);
      values.push(req.body[key] ?? null);
    }
  }
  if (updates.length === 0) return res.json({ ok: true });
  values.push(1);
  db.prepare(`UPDATE settings SET ${updates.join(', ')} WHERE id=?`).run(...values);
  res.json({ ok: true });
});

export default router;
