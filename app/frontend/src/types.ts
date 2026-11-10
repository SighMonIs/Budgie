export type CategorySlug = 'bills' | 'subscriptions' | 'savings';
export type Frequency = 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';

export interface Bill {
  id: number;
  category: CategorySlug;
  name: string;
  amount: number;            // cents, per `frequency`
  frequency: Frequency;
  due_day: number | null;
  notes: string | null;
  goal_target: number | null; // savings goals only
  goal_saved: number | null;
  perFortnight: number;
}

export interface Dashboard {
  pay: number;
  nextPayday: string;
  theme: 'dark' | 'light';
  setAside: number;
  leftover: number;
  bills: Bill[];
}
