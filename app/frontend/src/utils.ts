import { CategorySlug, Frequency } from './types';

export const CATEGORIES: { slug: CategorySlug; name: string; color: string }[] = [
  { slug: 'bills',         name: 'Bills',         color: '#ff6b5e' },
  { slug: 'subscriptions', name: 'Subscriptions', color: '#54a0ff' },
  { slug: 'savings',       name: 'Savings',       color: '#feca57' },
];

export const FREQUENCIES: { value: Frequency; label: string; days: number }[] = [
  { value: 'weekly',      label: 'Weekly',      days: 7 },
  { value: 'fortnightly', label: 'Fortnightly', days: 14 },
  { value: 'monthly',     label: 'Monthly',     days: 365 / 12 },
  { value: 'quarterly',   label: 'Quarterly',   days: 365 / 4 },
  { value: 'yearly',      label: 'Yearly',      days: 365 },
];

// Same maths as the backend (backend/src/logic.js) — used for the live hint in the bill form
export function perFortnight(cents: number, frequency: Frequency): number {
  const days = FREQUENCIES.find(f => f.value === frequency)!.days;
  return Math.round(cents * (14 / days));
}

export function fmtAUD(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return sign + '$' + (Math.abs(cents) / 100).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// "12.5" -> 1250
export function toCents(str: string): number {
  return Math.round(parseFloat(str || '0') * 100) || 0;
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
