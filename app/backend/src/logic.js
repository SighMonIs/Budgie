// Frequency normalisation → per-fortnight cents
export function perFortnight(amountCents, frequency) {
  const factors = {
    weekly:       2,
    fortnightly:  1,
    monthly:      12 / 26,
    monthly_half: 0.5,
    quarterly:    4  / 26,
    yearly:       1  / 26,
  };
  const f = factors[frequency] ?? 1;
  return Math.round(amountCents * f);
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
    const pf = perFortnight(b.amount, b.frequency);
    if (b.category in totals) totals[b.category] += pf;
  }
  return totals;
}
