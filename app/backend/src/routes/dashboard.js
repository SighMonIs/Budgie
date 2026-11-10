import { Router } from 'express';
import { getDb } from '../db.js';
import { perFortnight } from '../logic.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT pay_amount, next_payday, theme FROM settings WHERE id = 1').get();
  const bills = db.prepare('SELECT * FROM bills ORDER BY id').all()
    .map(b => ({ ...b, perFortnight: perFortnight(b.amount, b.frequency) }));
  const { adjust } = db.prepare(
    `SELECT COALESCE(SUM(CASE kind WHEN 'add' THEN amount ELSE -amount END), 0) AS adjust FROM fund_adjustments`
  ).get();

  const setAside = bills.reduce((sum, b) => sum + b.perFortnight, 0);
  res.json({
    pay: settings.pay_amount,
    nextPayday: settings.next_payday,
    theme: settings.theme,
    setAside,
    leftover: settings.pay_amount - setAside + adjust,
    bills,
  });
});

export default router;
