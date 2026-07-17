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

export async function fetchBillPayments(billId: number) {
  const r = await fetch(`${BASE}/bills/${billId}/payments`);
  return r.json();
}

export async function fetchRecentPayments() {
  const r = await fetch(`${BASE}/bills/payments/recent`);
  return r.json();
}

export async function createBillPayment(billId: number, data: { amount: number; paid_date?: string | null }) {
  const r = await fetch(`${BASE}/bills/${billId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}

export async function deleteBillPayment(billId: number, paymentId: number) {
  const r = await fetch(`${BASE}/bills/${billId}/payments/${paymentId}`, { method: 'DELETE' });
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
