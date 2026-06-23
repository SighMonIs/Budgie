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
  const { currency, pay_amount, pay_frequency, next_payday, theme, accent, pending_pay_amount, pending_pay_date } = req.body;
  db.prepare(`
    UPDATE settings
    SET currency=?, pay_amount=?, pay_frequency=?, next_payday=?, theme=?, accent=?,
        pending_pay_amount=?, pending_pay_date=?
    WHERE id=1
  `).run(
    currency, pay_amount, pay_frequency, next_payday, theme, accent,
    pending_pay_amount ?? null, pending_pay_date ?? null
  );
  res.json({ ok: true });
});

export default router;
