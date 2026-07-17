import React, { useState, useEffect } from 'react';
import { Bill, Account, Payee } from '../types';
import { fmtAUD, perFortnight } from '../utils';
import { createBill, updateBill, deleteBill, fetchAccounts, fetchPayees } from '../api';
import ConfirmModal from './ConfirmModal';
import NumberStepper from './NumberStepper';

interface Props {
  bill?: Bill;
  defaultCategory?: string;
  onClose: () => void;
  onDone: () => void;
}

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
const FREQ_LABELS: Record<string, string> = { daily: 'Days', weekly: 'Weeks', monthly: 'Months' };

const label: React.CSSProperties = { fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none' };
const selectStyle: React.CSSProperties = { ...inputStyle };

export default function AddBillModal({ bill, defaultCategory, onClose, onDone }: Props) {
  const [category, setCategory] = useState<'bills' | 'subscriptions' | 'savings'>(
    bill?.category ?? (defaultCategory as 'bills' | 'subscriptions' | 'savings') ?? 'bills'
  );
  const [name, setName] = useState(bill?.name ?? '');
  const [amountStr, setAmountStr] = useState(bill ? (bill.amount / 100).toFixed(2) : '');
  const [frequency, setFrequency] = useState(bill?.frequency ?? 'monthly');
  const [frequencyInterval, setFrequencyInterval] = useState(String(bill?.frequency_interval ?? 1));
  const [dueDay, setDueDay] = useState(bill?.due_day ? String(bill.due_day) : '');
  const [method, setMethod] = useState<'auto' | 'manual'>(bill?.method ?? 'auto');
  const [payeeId, setPayeeId] = useState<string>(bill?.payee_id ? String(bill.payee_id) : '');
  const [notes, setNotes] = useState(bill?.notes ?? '');
  const [goalTarget, setGoalTarget] = useState(bill?.goal_target ? (bill.goal_target / 100).toFixed(2) : '');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [accountId, setAccountId] = useState<string>(bill?.account_id ? String(bill.account_id) : '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchAccounts().then(setAccounts);
    fetchPayees().then(setPayees);
  }, []);

  const amountCents = Math.round(parseFloat(amountStr || '0') * 100);
  const intervalNum = parseInt(frequencyInterval, 10) || 1;
  const pfCents = perFortnight(amountCents, frequency, intervalNum);

  const catOptions: { value: 'bills' | 'subscriptions' | 'savings'; label: string }[] = [
    { value: 'bills', label: 'Bills' },
    { value: 'subscriptions', label: 'Subscriptions' },
    { value: 'savings', label: 'Savings' },
  ];

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        category, name, amount: amountCents, frequency, frequency_interval: intervalNum,
        due_day: dueDay ? parseInt(dueDay) : null,
        account_id: accountId ? parseInt(accountId) : null,
        payee_id: payeeId ? parseInt(payeeId) : null,
        method, notes,
        goal_target: goalTarget ? Math.round(parseFloat(goalTarget) * 100) : null,
        goal_saved: bill?.goal_saved ?? null,
        use_average: bill?.use_average === 1,
        savings_mode: method,
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--muted)', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Name + Category */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 2 }}>
            <div style={label}>NAME</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Rent" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>CATEGORY</div>
            <select value={category} onChange={e => setCategory(e.target.value as 'bills' | 'subscriptions' | 'savings')} style={selectStyle}>
              {catOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {/* Amount + Frequency */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={label}>AMOUNT</div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
              <input
                value={amountStr}
                onChange={e => setAmountStr(e.target.value.replace(/[^\d.]/g, ''))}
                onBlur={() => amountStr && setAmountStr(parseFloat(amountStr).toFixed(2))}
                placeholder="0" className="sg"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 600 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, minHeight: 18 }}>
              {amountCents > 0 && (
                <>↳ sets aside <strong style={{ color: 'var(--text)' }}>{fmtAUD(pfCents)}</strong>/fn</>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>HOW OFTEN</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center', flexShrink: 0 }}>Every</span>
              <NumberStepper
                value={frequencyInterval}
                onChange={setFrequencyInterval}
                min={1}
                align="center"
                style={{ width: 76, flexShrink: 0 }}
              />
              <select value={frequency} onChange={e => setFrequency(e.target.value)}
                style={{ flex: 1, minWidth: 0, ...selectStyle }}>
                {FREQUENCIES.map(f => <option key={f} value={f}>{FREQ_LABELS[f]}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Due Day / Contribution Date */}
        <div>
          <div style={label}>
            {category === 'savings' ? 'CONTRIBUTION DATE' : 'DUE DAY OF MONTH'}
          </div>
          {category === 'savings' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDueDay('')} style={{
                flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                border: dueDay === '' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: dueDay === '' ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: dueDay === '' ? 'var(--text)' : 'var(--muted)',
              }}>On payday</button>
              <NumberStepper
                value={dueDay}
                onChange={setDueDay}
                min={1} max={31} allowEmpty
                placeholder="Day #"
                align="center"
                style={{
                  flex: 1, background: dueDay !== '' ? 'var(--surface2)' : 'transparent',
                  border: dueDay !== '' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                }}
              />
            </div>
          ) : (
            <NumberStepper
              value={dueDay}
              onChange={setDueDay}
              min={1} max={31} allowEmpty
              placeholder="e.g. 1"
              style={{ width: '100%' }}
            />
          )}
        </div>

        {/* Savings target */}
        {category === 'savings' && (
          <div>
            <div style={label}>TARGET AMOUNT</div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
              <input value={goalTarget} onChange={e => setGoalTarget(e.target.value.replace(/[^\d.]/g, ''))}
                onBlur={() => goalTarget && setGoalTarget(parseFloat(goalTarget).toFixed(2))}
                placeholder="10000" className="sg"
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontWeight: 600 }} />
            </div>
          </div>
        )}

        {/* Payment method */}
        <div>
          <div style={label}>PAYMENT METHOD</div>
          <select value={method} onChange={e => setMethod(e.target.value as 'auto' | 'manual')} style={selectStyle}>
            <option value="auto">Automatic</option>
            <option value="manual">Manual</option>
          </select>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            {method === 'auto'
              ? 'Paid automatically by your bank — Budgie just reserves it.'
              : 'You transfer this yourself. Budgie reminds you on the due date.'}
          </div>
        </div>

        {/* Paid From + Paid To */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={label}>PAID FROM</div>
            <select value={accountId} onChange={e => setAccountId(e.target.value)} style={selectStyle}>
              <option value="">Select account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>PAID TO</div>
            <select value={payeeId} onChange={e => setPayeeId(e.target.value)} style={selectStyle}>
              <option value="">Select payee</option>
              {payees.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <div style={label}>NOTES</div>
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. lease ends Dec 2026" style={inputStyle} />
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
