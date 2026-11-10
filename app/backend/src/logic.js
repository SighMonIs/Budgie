// Budgie is fortnightly-pay only: every bill is normalised to "cents per fortnight".
// 'daily' is legacy-only (used by the one-off DB migration), not offered in the UI.
const DAYS = { daily: 1, weekly: 7, fortnightly: 14, monthly: 365 / 12, quarterly: 365 / 4, yearly: 365 };

export const FREQUENCIES = ['weekly', 'fortnightly', 'monthly', 'quarterly', 'yearly'];
export const CATEGORIES = ['bills', 'subscriptions', 'savings'];

export function perFortnight(amountCents, frequency, interval = 1) {
  const days = (DAYS[frequency] ?? DAYS.monthly) * Math.max(1, interval || 1);
  return Math.round(amountCents * (14 / days));
}

// Local-time YYYY-MM-DD (set TZ on the container if it isn't your timezone)
export const todayISO = () => new Date().toLocaleDateString('en-CA');

export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Every payday that has passed: credit each savings goal its per-fortnight amount
// and move next_payday on by 14 days. Safe to call repeatedly.
export function rollPayday(db, today = todayISO()) {
  const s = db.prepare('SELECT next_payday FROM settings WHERE id = 1').get();
  if (!s || today < s.next_payday) return;

  const goals = db.prepare(`SELECT id, amount, frequency FROM bills WHERE category = 'savings'`).all();
  const credit = db.prepare('UPDATE bills SET goal_saved = COALESCE(goal_saved, 0) + ? WHERE id = ?');
  db.exec('BEGIN');
  try {
    let next = s.next_payday;
    for (; today >= next; next = addDays(next, 14)) {
      for (const g of goals) credit.run(perFortnight(g.amount, g.frequency), g.id);
    }
    db.prepare('UPDATE settings SET next_payday = ? WHERE id = 1').run(next);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
