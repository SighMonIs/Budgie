import React, { useState, useEffect, useCallback } from 'react';
import { Bill, BillPayment } from '../types';
import { fmtAUD } from '../utils';
import { fetchRecentPayments, createBillPayment, deleteBillPayment } from '../api';

interface Props {
  bills: Bill[];
  subscriptions: Bill[];
  onLogged: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 9,
  padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none',
};

export default function BillHistoryCard({ bills, subscriptions, onLogged }: Props) {
  const items = [...bills, ...subscriptions];
  const [billId, setBillId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [recent, setRecent] = useState<BillPayment[]>([]);
  const [logging, setLogging] = useState(false);

  const loadRecent = useCallback(() => {
    fetchRecentPayments().then(setRecent);
  }, []);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  function pickBill(id: string) {
    setBillId(id);
    const bill = items.find(b => String(b.id) === id);
    if (bill) setAmountStr((bill.amount / 100).toFixed(2));
  }

  async function logPayment() {
    const cents = Math.round(parseFloat(amountStr || '0') * 100);
    if (!billId || !cents) return;
    setLogging(true);
    try {
      await createBillPayment(parseInt(billId, 10), { amount: cents, paid_date: dateStr || null });
      setAmountStr('');
      loadRecent();
      onLogged();
    } finally {
      setLogging(false);
    }
  }

  async function removePayment(p: BillPayment) {
    await deleteBillPayment(p.bill_id, p.id);
    loadRecent();
    onLogged();
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>Bill history</div>

      <select value={billId} onChange={e => pickBill(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
        <option value="">Select a bill</option>
        {items.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, ...inputStyle, padding: '8px 10px' }}>
          <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
          <input
            value={amountStr}
            onChange={e => setAmountStr(e.target.value.replace(/[^\d.]/g, ''))}
            placeholder="Amount"
            className="sg"
            style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12.5 }}
          />
        </div>
        <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} style={inputStyle} />
      </div>

      <button
        onClick={logPayment}
        disabled={!billId || !amountStr || logging}
        style={{
          padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none',
          background: billId && amountStr ? 'var(--accent)' : 'var(--surface2)',
          color: billId && amountStr ? '#fff' : 'var(--muted)',
          cursor: billId && amountStr ? 'pointer' : 'default',
        }}
      >Log payment</button>

      {recent.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 170, overflowY: 'auto', marginTop: 2 }}>
          {recent.map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface2)', borderRadius: 8, padding: '6px 10px', fontSize: 11.5,
            }}>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.bill_name}</span>
              <span className="sg" style={{ fontWeight: 600, flexShrink: 0 }}>{fmtAUD(p.amount)}</span>
              {p.paid_date && (
                <span style={{ color: 'var(--muted)', fontSize: 10.5, flexShrink: 0 }}>
                  {new Date(p.paid_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              )}
              <button onClick={() => removePayment(p)} style={{
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer',
                fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0,
              }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
