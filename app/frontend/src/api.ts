const BASE = '/api';

export async function fetchDashboard() {
  const r = await fetch(`${BASE}/dashboard`);
  if (!r.ok) throw new Error('Failed to load dashboard');
  return r.json();
}

export async function fetchAccounts() {
  const r = await fetch(`${BASE}/accounts`);
  return r.json();
}

export async function fetchPayees() {
  const r = await fetch(`${BASE}/payees`);
  return r.json();
}

export async function createBill(data: Record<string, unknown>) {
  const r = await fetch(`${BASE}/bills`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}

export async function updateBill(id: number, data: Record<string, unknown>) {
  const r = await fetch(`${BASE}/bills/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}

export async function deleteBill(id: number) {
  const r = await fetch(`${BASE}/bills/${id}`, { method: 'DELETE' });
  return r.json();
}

export async function createFundAdjustment(data: { kind: string; amount: number; purpose?: string; destination?: string }) {
  const r = await fetch(`${BASE}/funds`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}

export async function updateSettings(data: Record<string, unknown>) {
  const r = await fetch(`${BASE}/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}
