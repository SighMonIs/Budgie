export function fmtAUD(cents: number): string {
  const dollars = cents / 100;
  return '$' + dollars.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function perFortnight(amountCents: number, frequency: string): number {
  const factors: Record<string, number> = {
    weekly:      2,
    fortnightly: 1,
    monthly:     12 / 26,
    quarterly:   4 / 26,
    yearly:      1 / 26,
  };
  return Math.round(amountCents * (factors[frequency] ?? 1));
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getDueDates(bills: { due_day: number | null }[], year: number, month: number): number[] {
  return bills
    .map(b => b.due_day)
    .filter((d): d is number => d !== null);
}

export function getPaydaysInMonth(nextPayday: string, year: number, month: number): number[] {
  const days: number[] = [];
  let d = new Date(nextPayday);
  // Walk backwards to find earlier paydays in the month if needed
  const start = new Date(d);
  while (start.getTime() > new Date(year, month - 1, 1).getTime()) {
    start.setDate(start.getDate() - 14);
  }
  d = new Date(start);
  // Walk forward and collect days in target month
  const limit = new Date(year, month, 1); // first day of next month
  while (d < limit) {
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      days.push(d.getDate());
    }
    d = new Date(d.getTime() + 14 * 86400000);
  }
  return days;
}
