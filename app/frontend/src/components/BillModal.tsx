import React, { useState } from 'react';
import { Bill, CategorySlug, Frequency } from '../types';
import { CATEGORIES, FREQUENCIES, fmtAUD, perFortnight, toCents } from '../utils';
import { saveBill, deleteBill } from '../api';
import ConfirmModal from './ConfirmModal';

interface Props {
  bill?: Bill;                    // editing when set, creating otherwise
  onClose: () => void;
  onDone: () => void;
}

const dollars = (cents: number | null | undefined) => (cents ? (cents / 100).toFixed(2) : '');
const money = (set: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value.replace(/[^\d.]/g, ''));

export default function BillModal({ bill, onClose, onDone }: Props) {
  const [category, setCategory] = useState<CategorySlug>(bill?.category ?? 'bills');
  const [name, setName] = useState(bill?.name ?? '');
  const [amount, setAmount] = useState(dollars(bill?.amount));
  const [frequency, setFrequency] = useState<Frequency>(bill?.frequency ?? 'monthly');
  const [dueDay, setDueDay] = useState(bill?.due_day ? String(bill.due_day) : '');
  const [notes, setNotes] = useState(bill?.notes ?? '');
  const [target, setTarget] = useState(dollars(bill?.goal_target));
  const [saved, setSaved] = useState(dollars(bill?.goal_saved));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isGoal = category === 'savings';
  const cents = toCents(amount);
  const canSave = name.trim() && cents > 0 && !busy;

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    try { await action(); onDone(); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }

  const save = () => run(() => saveBill(bill?.id, {
    category, name, amount: cents, frequency, notes,
    due_day: dueDay ? parseInt(dueDay, 10) : null,
    goal_target: toCents(target) || null,
    goal_saved: toCents(saved),
  }));

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 180px' }}>
              <div className="label">NAME</div>
              <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Rent" autoFocus />
            </div>
            <div style={{ flex: '1 1 130px' }}>
              <div className="label">CATEGORY</div>
              <select className="field" value={category} onChange={e => setCategory(e.target.value as CategorySlug)}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <div className="label">{isGoal ? 'SET ASIDE' : 'AMOUNT'}</div>
              <input className="field sg" inputMode="decimal" value={amount} onChange={money(setAmount)} placeholder="$0.00" />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <div className="label">HOW OFTEN</div>
              <select className="field" value={frequency} onChange={e => setFrequency(e.target.value as Frequency)}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          {cents > 0 && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: -8 }}>
              ↳ sets aside <strong style={{ color: 'var(--text)' }}>{fmtAUD(perFortnight(cents, frequency))}</strong> each payday
            </div>
          )}

          {isGoal && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 160px' }}>
                <div className="label">TARGET</div>
                <input className="field sg" inputMode="decimal" value={target} onChange={money(setTarget)} placeholder="$10,000" />
              </div>
              <div style={{ flex: '1 1 160px' }}>
                <div className="label">SAVED SO FAR</div>
                <input className="field sg" inputMode="decimal" value={saved} onChange={money(setSaved)} placeholder="$0.00" />
              </div>
            </div>
          )}

          <details open={!!(bill?.due_day || bill?.notes)}>
            <summary style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', cursor: 'pointer' }}>
              {isGoal ? 'Notes' : 'Due day & notes'}
            </summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {!isGoal && (
                <div>
                  <div className="label">DUE DAY OF MONTH (OPTIONAL)</div>
                  <input className="field" type="number" min={1} max={31} value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="e.g. 1" />
                </div>
              )}
              <div>
                <div className="label">NOTES</div>
                <input className="field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Who to pay, account details, lease ends Dec…" />
              </div>
            </div>
          </details>

          {error && <div style={{ fontSize: 12.5, color: 'var(--negative)' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10 }}>
            {bill && <button className="btn danger" onClick={() => setConfirmDelete(true)}>Delete</button>}
            <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn primary" style={{ flex: 2 }} disabled={!canSave} onClick={save}>Save</button>
          </div>
        </div>
      </div>

      {confirmDelete && bill && (
        <ConfirmModal
          title={`Delete "${bill.name}"?`}
          message="This permanently removes it, and Budgie stops setting it aside each payday."
          onConfirm={() => run(() => deleteBill(bill.id))}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
