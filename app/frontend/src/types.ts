export interface Settings {
  id: number;
  currency: string;
  pay_amount: number;
  pay_frequency: string;
  next_payday: string;
  theme: string;
  accent: string;
  pending_pay_amount: number | null;
  pending_pay_date: string | null;
}

export interface Bill {
  id: number;
  category: 'bills' | 'subscriptions' | 'savings';
  name: string;
  amount: number;
  frequency: string;
  due_day: number | null;
  due_date: string | null;
  account_id: number | null;
  payee_id: number | null;
  method: 'auto' | 'manual';
  notes: string | null;
  goal_target: number | null;
  goal_saved: number | null;
  goal_deadline: string | null;
  perFortnight: number;
  account_name: string | null;
  payee_name: string | null;
  payee_bsb: string | null;
  payee_number: string | null;
  payee_reference: string | null;
  use_average: number;
  savings_mode: 'manual' | 'auto';
  last_contributed_at: string | null;
}

export interface Totals {
  bills: number;
  subscriptions: number;
  savings: number;
  leftover: number;
  pay: number;
}

export interface FundAdjustment {
  id: number;
  kind: 'add' | 'take';
  amount: number;
  purpose: string | null;
  destination: string | null;
  created_at: string;
}

export interface DashboardData {
  settings: Settings;
  totals: Totals;
  bills: Bill[];
  subscriptions: Bill[];
  savings: Bill[];
  adjustments: FundAdjustment[];
  nextPayday: string;
  nextThirdPay: string | null;
  pendingPay: { amount: number; effectiveDate: string } | null;
}

export interface Account {
  id: number;
  name: string;
  bsb: string | null;
  number: string | null;
}

export interface Payee {
  id: number;
  name: string;
  bsb: string | null;
  number: string | null;
  reference: string | null;
}
