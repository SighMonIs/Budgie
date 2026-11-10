import { Dashboard } from './types';

async function send(method: string, url: string, body?: unknown) {
  const r = await fetch(`/api${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error ?? `Request failed (${r.status})`);
  return json;
}

export const fetchDashboard = (): Promise<Dashboard> => send('GET', '/dashboard');
export const saveBill = (id: number | undefined, bill: Record<string, unknown>) =>
  id ? send('PUT', `/bills/${id}`, bill) : send('POST', '/bills', bill);
export const deleteBill = (id: number) => send('DELETE', `/bills/${id}`);
export const updateSettings = (data: Record<string, unknown>) => send('PUT', '/settings', data);
