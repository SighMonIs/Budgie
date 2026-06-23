import { Router } from 'express';
import { getDb } from '../db.js';
import { perFortnight, computeTotals, thirdPaydayMonths } from '../logic.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const rawBills = db.prepare(`
    SELECT b.*, a.name as account_name, p.name as payee_name, p.bsb as payee_bsb, p.number as payee_number, p.reference as payee_reference
    FROM bills b
    LEFT JOIN accounts a ON b.account_id = a.id
    LEFT JOIN payees p ON b.payee_id = p.id
    ORDER BY b.category, b.id
  `).all();

  const avgStmt = db.prepare('SELECT AVG(amount) as avg FROM bill_payments WHERE bill_id=?');
  const bills = rawBills.map(b => {
    if (b.use_average) {
      const row = avgStmt.get(b.id);
      if (row?.avg) return { ...b, amount: Math.round(row.avg) };
    }
    return b;
  });

  const totals = computeTotals(bills);
  const adjustments = db.prepare('SELECT * FROM fund_adjustments ORDER BY created_at DESC').all();
  const adjDelta = adjustments.reduce((acc, a) => {
    return a.kind === 'add' ? acc + a.amount : acc - a.amount;
  }, 0);

  const leftover = settings.pay_amount - totals.bills - totals.subscriptions - totals.savings + adjDelta;

  const billRows = bills.filter(b => b.category === 'bills').map(b => ({
    ...b,
    perFortnight: perFortnight(b.amount, b.frequency),
  }));
  const subRows = bills.filter(b => b.category === 'subscriptions').map(b => ({
    ...b,
    perFortnight: perFortnight(b.amount, b.frequency),
  }));
  const savingsRows = bills.filter(b => b.category === 'savings').map(b => ({
    ...b,
    perFortnight: perFortnight(b.amount, b.frequency),
  }));

  // Calendar: payday dates + due dates for this month
  const nextPayday = new Date(settings.next_payday);
  const thirdPays = thirdPaydayMonths(settings.next_payday, 3);
  const nextThirdPay = thirdPays[0] || null;

  res.json({
    settings,
    totals: {
      bills: totals.bills,
      subscriptions: totals.subscriptions,
      savings: totals.savings,
      leftover,
      pay: settings.pay_amount,
    },
    pendingPay: settings.pending_pay_amount ? {
      amount: settings.pending_pay_amount,
      effectiveDate: settings.pending_pay_date,
    } : null,
    bills: billRows,
    subscriptions: subRows,
    savings: savingsRows,
    adjustments,
    nextPayday: settings.next_payday,
    nextThirdPay: nextThirdPay ? nextThirdPay.toISOString().slice(0, 10) : null,
  });
});

export default router;
