import React, { useState } from 'react';
import { Bill } from '../types';
import { createBillPayment } from '../api';
import Dropdown from './Dropdown';

interface Props {
  bills: Bill[];
  onLogged: () => void;
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 9,
  padding: '8px 10px', color: 'var(--text)', fontSize: 12.5, outline: 'none',
};

export default function BillHistoryCard({ bills, onLogged }: Props) {
  const items = bills.filter(b => b.use_average === 1);
  const [billId, setBillId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [logging, setLogging] = useState(false);

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
      onLogged();
    } finally {
      setLogging(false);
    }
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>Payment History</div>

      {items.length === 0 ? (
        <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
          Tick "Historic" on a bill in its edit modal to start logging payments for it here.
        </div>
      ) : (
        <>
          <Dropdown
            value={billId}
            onChange={pickBill}
            options={[{ value: '', label: 'Select a bill' }, ...items.map(b => ({ value: String(b.id), label: b.name }))]}
            label="Bill"
          />

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', ...inputStyle, padding: '8px 10px' }}>
            <span style={{ color: 'var(--muted)', marginRight: 4 }}>$</span>
            <input
              value={amountStr}
              onChange={e => setAmountStr(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="Amount"
              className="sg"
              style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12.5 }}
            />
          </div>

          <input type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} style={{ ...inputStyle, width: '100%' }} />

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
        </>
      )}
    </div>
  );
}
