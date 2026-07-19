import { Router } from 'express';
import { getDb } from '../db.js';
import { perFortnight, computeTotals, thirdPaydayMonths } from '../logic.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order, id').all();
  const rawBills = db.prepare(`
    SELECT b.*, a.name as account_name, p.name as payee_name, p.bsb as payee_bsb, p.number as payee_number, p.reference as payee_reference
    FROM bills b
    LEFT JOIN accounts a ON b.account_id = a.id
    LEFT JOIN payees p ON b.payee_id = p.id
    ORDER BY b.category, b.sort_order, b.id
  `).all();

  const avgStmt = db.prepare('SELECT AVG(amount) as avg FROM bill_payments WHERE bill_id=?');
  const bills = rawBills.map(b => {
    if (b.use_average) {
      const row = avgStmt.get(b.id);
      if (row?.avg) return { ...b, amount: Math.round(row.avg) };
    }
    return b;
  });

  // Auto-contribute goal-style (credit-type category) bills when payday arrives
  const creditSlugs = new Set(categories.filter(c => c.type === 'credit').map(c => c.slug));
  const today = new Date().toISOString().slice(0, 10);
  if (today >= settings.next_payday) {
    const autoGoals = rawBills.filter(b => creditSlugs.has(b.category) && b.savings_mode === 'auto');
    for (const g of autoGoals) {
      if (!g.last_contributed_at || g.last_contributed_at < settings.next_payday) {
        db.prepare('UPDATE bills SET goal_saved = COALESCE(goal_saved, 0) + ?, last_contributed_at = ? WHERE id=?')
          .run(g.amount, today, g.id);
      }
    }
  }

  const totals = computeTotals(bills);
  const adjustments = db.prepare('SELECT * FROM fund_adjustments ORDER BY created_at DESC').all();
  const adjDelta = adjustments.reduce((acc, a) => {
    return a.kind === 'add' ? acc + a.amount : acc - a.amount;
  }, 0);

  const totalOut = Object.values(totals).reduce((sum, v) => sum + v, 0);
  const leftover = settings.pay_amount - totalOut + adjDelta;

  // Group bills by category slug — bill-driven so nothing silently disappears,
  // even if a bill's category doesn't (or no longer) match a known category row
  const itemsByCategory = {};
  for (const b of bills) {
    const withPf = { ...b, perFortnight: perFortnight(b.amount, b.frequency, b.frequency_interval) };
    (itemsByCategory[b.category] ??= []).push(withPf);
  }

  // Calendar: payday dates + due dates for this month
  const thirdPays = thirdPaydayMonths(settings.next_payday, 3);
  const nextThirdPay = thirdPays[0] || null;

  res.json({
    settings,
    totals: { ...totals, leftover, pay: settings.pay_amount },
    pendingPay: settings.pending_pay_amount ? {
      amount: settings.pending_pay_amount,
      effectiveDate: settings.pending_pay_date,
    } : null,
    itemsByCategory,
    adjustments,
    nextPayday: settings.next_payday,
    nextThirdPay: nextThirdPay ? nextThirdPay.toISOString().slice(0, 10) : null,
  });
});

export default router;
