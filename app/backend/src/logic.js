// Frequency normalisation → per-fortnight cents
// frequency is a unit ('daily' | 'weekly' | 'monthly'); interval is "every N units"
const DAYS_PER_UNIT = { daily: 1, weekly: 7, monthly: 365 / 12 };

export function perFortnight(amountCents, frequency, interval = 1) {
  const unitDays = DAYS_PER_UNIT[frequency] ?? DAYS_PER_UNIT.monthly;
  const totalDays = unitDays * Math.max(1, interval || 1);
  return Math.round(amountCents * (14 / totalDays));
}

// Detect 3rd-payday months for a given next_payday string
export function thirdPaydayMonths(nextPaydayISO, count = 6) {
  const results = [];
  let date = new Date(nextPaydayISO);
  const monthlyCounts = {};

  for (let i = 0; i < count * 10; i++) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    if (monthlyCounts[key] === 3) results.push(new Date(date));
    if (results.length >= count) break;
    date = new Date(date.getTime() + 14 * 86400000);
  }
  return results;
}

// Compute dashboard totals from an array of bills rows
export function computeTotals(bills) {
  const totals = { bills: 0, subscriptions: 0, savings: 0 };
  for (const b of bills) {
    const pf = perFortnight(b.amount, b.frequency, b.frequency_interval);
    if (b.category in totals) totals[b.category] += pf;
  }
  return totals;
}
