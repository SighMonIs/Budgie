import React, { useState, useEffect } from 'react';
import { Bill, Account, Payee } from '../types';
import { fmtAUD, perFortnight } from '../utils';
import { createBill, updateBill, deleteBill, fetchAccounts, fetchPayees } from '../api';
import ConfirmModal from './ConfirmModal';

interface BillPayment {
  id: number;
  amount: number;
  paid_date: string | null;
  note: string | null;
}

interface Props {
  bill?: Bill;
  onClose: () => void;
  onDone: () => void;
}

const FREQUENCIES = ['weekly', 'fortnightly', 'monthly', 'monthly_half', 'quarterly', 'yearly'];
const FREQ_LABELS: Record<string, string> = { weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', monthly_half: 'Monthly (÷ 2)', quarterly: 'Quarterly', yearly: 'Yearly' };

export default function AddBillModal({ bill, onClose, onDone }: Props) {
  const [category, setCategory] = useState<'bills' | 'subscriptions' | 'savings'>(bill?.category ?? 'bills');
  const [name, setName] = useState(bill?.name ?? '');
  const [amountStr, setAmountStr] = useState(bill ? String(bill.amount / 100) : '');
  const [frequency, setFrequency] = useState(bill?.frequency ?? 'monthly');
  const [dueDay, setDueDay] = useState(bill?.due_day ? String(bill.due_day) : '');
  const [method, setMethod] = useState<'auto' | 'manual'>(bill?.method ?? 'auto');
  const [payeeName, setPayeeName] = useState(bill?.payee_name ?? '');
  const [notes, setNotes] = useState(bill?.notes ?? '');
  const [goalTarget, setGoalTarget] = useState(bill?.goal_target ? String(bill.goal_target / 100) : '');
  const [goalSaved, setGoalSaved] = useState(bill?.goal_saved ? String(bill.goal_saved / 100) : '');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [accountId, setAccountId] = useState<string>(bill?.account_id ? String(bill.account_id) : '');
  const [useAverage, setUseAverage] = useState(bill?.use_average === 1);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [payments, setPayments] = useState<BillPayment[]>([]);
  const [newPaymentStr, setNewPaymentStr] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');

  useEffect(() => {
    fetchAccounts().then(setAccounts);
    fetchPayees().then(setPayees);
  }, []);

  useEffect(() => {
    if (bill?.id) {
      fetch(`/api/bills/${bill.id}/payments`).then(r => r.json()).then(setPayments);
    }
  }, [bill?.id]);

  const avgCents = payments.length
    ? Math.round(payments.reduce((s, p) => s + p.amount, 0) / payments.length)
    : 0;

  async function addPayment() {
    const cents = Math.round(parseFloat(newPaymentStr || '0') * 100);
    if (!cents || !bill?.id) return;
    const res = await fetch(`/api/bills/${bill.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: cents, paid_date: newPaymentDate || null }),
    });
    const { id } = await res.json();
    setPayments(prev => [{ id, amount: cents, paid_date: newPaymentDate || null, note: null }, ...prev]);
    setNewPaymentStr('');
    setNewPaymentDate('');
  }

  async function removePayment(pid: number) {
    if (!bill?.id) return;
    await fetch(`/api/bills/${bill.id}/payments/${pid}`, { method: 'DELETE' });
    setPayments(prev => prev.filter(p => p.id !== pid));
  }

  const amountCents = useAverage && avgCents ? avgCents : Math.round(parseFloat(amountStr || '0') * 100);
  const pfCents = perFortnight(amountCents, frequency);

  const catOptions: { value: 'bills' | 'subscriptions' | 'savings'; label: string; color: string }[] = [
    { value: 'bills', label: 'Bills', color: '#ff6b5e' },
    { value: 'subscriptions', label: 'Subscriptions', color: '#54a0ff' },
    { value: 'savings', label: 'Savings', color: '#feca57' },
  ];

  async function handleSave() {
    setSaving(true);
    try {
      let payeeId: number | null = null;
      if (payeeName.trim()) {
        const existing = payees.find(p => p.name.toLowerCase() === payeeName.trim().toLowerCase());
        if (existing) {
          payeeId = existing.id;
        } else {
          const res = await fetch('/api/payees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: payeeName.trim() }) });
          const data = await res.json();
          payeeId = data.id;
        }
      }

      const payload = {
        category, name, amount: amountCents, frequency,
        due_day: dueDay ? parseInt(dueDay) : null,
        account_id: accountId ? parseInt(accountId) : null,
        payee_id: payeeId,
        method, notes,
        goal_target: goalTarget ? Math.round(parseFloat(goalTarget) * 100) : null,
        goal_saved: goalSaved ? Math.round(parseFloat(goalSaved) * 100) : null,
        use_average: useAverage,
      };

      if (bill) {
        await updateBill(bill.id, payload);
      } else {
        await createBill(payload);
      }
      onDone();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!bill) return;
    await deleteBill(bill.id);
    onDone();
  }

  return (
    <>
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      overflowY: 'auto', padding: '24px 0',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: '28px 30px',
        width: 540, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: 18, margin: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>
              {bill ? 'Edit' : 'Add a bill'}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
              Budgie will set this aside each payday
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--muted)', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Category */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>CATEGORY</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {catOptions.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)} style={{
                flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: category === c.value ? `1.5px solid var(--accent)` : '1px solid var(--line)',
                background: category === c.value ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: category === c.value ? 'var(--text)' : 'var(--muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>BILL NAME</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Rent"
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
        </div>

        {/* Amount + Frequency */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>AMOUNT</div>
            <div style={{ display: 'flex', alignItems: 'center', background: useAverage ? 'rgba(62,207,142,0.07)' : 'var(--surface2)', border: `1px solid ${useAverage ? '#3ecf8e55' : 'var(--line)'}`, borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
              <input
                value={useAverage ? (avgCents / 100).toFixed(2) : amountStr}
                onChange={e => !useAverage && setAmountStr(e.target.value.replace(/[^\d.]/g, ''))}
                readOnly={useAverage}
                placeholder="0" className="sg"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: useAverage ? '#3ecf8e' : 'var(--text)', fontSize: 15, fontWeight: 600, cursor: useAverage ? 'default' : 'text' }} />
              {useAverage && <span style={{ fontSize: 10, color: '#3ecf8e', fontWeight: 700, letterSpacing: '0.05em', flexShrink: 0 }}>AUTO</span>}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, minHeight: 18 }}>
              {amountCents > 0 && (
                <>↳ sets aside <strong style={{ color: 'var(--text)' }}>{fmtAUD(pfCents)}</strong>/fn</>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>HOW OFTEN</div>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
              {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
            </select>
          </div>
        </div>

        {/* Due Day + Account */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>DUE DAY OF MONTH</div>
            <input value={dueDay} onChange={e => setDueDay(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1" type="number" min="1" max="31"
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>PAID FROM</div>
            <select value={accountId} onChange={e => setAccountId(e.target.value)}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }}>
              <option value="">Select account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>PAYMENT METHOD</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['auto', 'manual'] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: method === m ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: method === m ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: method === m ? 'var(--text)' : 'var(--muted)',
              }}>
                {m === 'auto' ? '⚡ Automatic' : '✋ Manual'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            {method === 'auto'
              ? 'Paid automatically by your bank — Budgie just reserves it.'
              : 'You transfer this yourself. Budgie reminds you on the due date.'}
          </div>
        </div>

        {/* Payee */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>PAID TO</div>
          <input value={payeeName} onChange={e => setPayeeName(e.target.value)}
            placeholder="Ray White Real Estate"
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
        </div>

        {/* Savings goal extras */}
        {category === 'savings' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>TARGET AMOUNT</div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
                <input value={goalTarget} onChange={e => setGoalTarget(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="10000" className="sg"
                  style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 600 }} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>AMOUNT SAVED</div>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
                <input value={goalSaved} onChange={e => setGoalSaved(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0" className="sg"
                  style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 600 }} />
              </div>
            </div>
          </div>
        )}

        {/* Payment history — only when editing an existing bill */}
        {bill && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)' }}>PAYMENT HISTORY</div>
              {payments.length > 0 && (
                <>
                  <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    avg <strong style={{ color: 'var(--text)' }}>{fmtAUD(avgCents)}</strong>
                  </div>
                  <button onClick={() => setAmountStr(String(avgCents / 100))} style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                    background: 'rgba(124,108,240,0.15)', border: '1px solid var(--accent)',
                    color: 'var(--accent)', cursor: 'pointer',
                  }}>Use once</button>
                  <button onClick={() => setUseAverage(u => !u)} style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    background: useAverage ? '#3ecf8e' : 'var(--surface2)',
                    color: useAverage ? '#fff' : 'var(--muted)',
                  }}>{useAverage ? '✓ Always average' : 'Always average'}</button>
                </>
              )}
            </div>

            {/* Add payment row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 9, padding: '8px 12px', flex: 1 }}>
                <span style={{ color: 'var(--muted)', marginRight: 4, fontSize: 13 }}>$</span>
                <input
                  value={newPaymentStr}
                  onChange={e => setNewPaymentStr(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="Amount paid"
                  className="sg"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}
                />
              </div>
              <input
                type="date"
                value={newPaymentDate}
                onChange={e => setNewPaymentDate(e.target.value)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 9, padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none' }}
              />
              <button onClick={addPayment} disabled={!newPaymentStr} style={{
                padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                background: newPaymentStr ? 'var(--accent)' : 'var(--surface2)',
                color: newPaymentStr ? '#fff' : 'var(--muted)',
                border: 'none', cursor: newPaymentStr ? 'pointer' : 'default',
              }}>Add</button>
            </div>

            {/* Payment list */}
            {payments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                {payments.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--surface2)', borderRadius: 8, padding: '7px 12px',
                  }}>
                    <span className="sg" style={{ fontWeight: 600, fontSize: 13.5 }}>{fmtAUD(p.amount)}</span>
                    {p.paid_date && (
                      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                        {new Date(p.paid_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <div style={{ flex: 1 }} />
                    <button onClick={() => removePayment(p.id)} style={{
                      background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                      fontSize: 15, lineHeight: 1, padding: '0 2px',
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>NOTES</div>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. lease ends Dec 2026"
            style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10 }}>
          {bill && (
            <button onClick={() => setConfirmDelete(true)} style={{
              padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'transparent', border: '1px solid #ff6b5e', color: '#ff6b5e', cursor: 'pointer',
            }}>Delete</button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!name || !amountCents || saving} style={{
            flex: 2, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: name && amountCents ? 'var(--accent)' : 'var(--surface2)',
            color: name && amountCents ? '#fff' : 'var(--muted)',
            border: 'none', cursor: name && amountCents ? 'pointer' : 'default',
          }}>Save bill</button>
        </div>
      </div>
    </div>

    {confirmDelete && bill && (
      <ConfirmModal
        title={`Delete "${bill.name}"?`}
        message="This will permanently remove the bill and stop Budgie setting it aside each payday."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    )}
    </>
  );
}
