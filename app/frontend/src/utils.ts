export function fmtAUD(cents: number): string {
  const dollars = cents / 100;
  return '$' + dollars.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const DAYS_PER_UNIT: Record<string, number> = { daily: 1, weekly: 7, monthly: 365 / 12 };

export function perFortnight(amountCents: number, frequency: string, interval: number = 1): number {
  const unitDays = DAYS_PER_UNIT[frequency] ?? DAYS_PER_UNIT.monthly;
  const totalDays = unitDays * Math.max(1, interval || 1);
  return Math.round(amountCents * (14 / totalDays));
}

export type SortField = 'name' | 'due' | 'total';
export type SortDir = 'asc' | 'desc';
export interface SortState {
  field: SortField;
  dir: SortDir;
}

export function sortItems<T extends { name: string; due_day: number | null; perFortnight: number }>(
  items: T[], sort: SortState | null
): T[] {
  if (!sort) return items;
  const dir = sort.dir === 'asc' ? 1 : -1;
  const arr = [...items];
  arr.sort((a, b) => {
    if (sort.field === 'name') return a.name.localeCompare(b.name) * dir;
    if (sort.field === 'due') {
      const av = a.due_day ?? 999, bv = b.due_day ?? 999;
      return (av - bv) * dir;
    }
    return (a.perFortnight - b.perFortnight) * dir;
  });
  return arr;
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
