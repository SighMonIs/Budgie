import React, { useState, useEffect, useRef } from 'react';
import { Totals } from '../types';
import { fmtAUD, formatDate } from '../utils';

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly',
};

interface Props {
  totals: Totals;
  nextPayday: string;
  frequency: string;
  pendingPay?: { amount: number; effectiveDate: string } | null;
  editMode: boolean;
  onSaved: () => void;
}

export default function PayHeader({ totals, nextPayday, frequency, pendingPay, editMode, onSaved }: Props) {
  const { pay, bills, subscriptions, savings, leftover } = totals;

  // Draft state for inline editing
  const [draftPay, setDraftPay]   = useState(String(pay / 100));
  const [draftFreq, setDraftFreq] = useState(frequency);
  const [draftDate, setDraftDate] = useState(nextPayday.slice(0, 10));

  // Reset drafts whenever we enter edit mode
  const prevEdit = useRef(editMode);
  useEffect(() => {
    if (editMode && !prevEdit.current) {
      setDraftPay(String(pay / 100));
      setDraftFreq(frequency);
      setDraftDate(nextPayday.slice(0, 10));
    }
    // Save when exiting edit mode
    if (!editMode && prevEdit.current) {
      const amount = Math.round(parseFloat(draftPay || '0') * 100);
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay_amount: amount, pay_frequency: draftFreq, next_payday: draftDate }),
      }).then(onSaved);
    }
    prevEdit.current = editMode;
  }, [editMode]);

  const displayPay  = editMode ? Math.round(parseFloat(draftPay || '0') * 100) : pay;
  const displayFreq = editMode ? draftFreq : frequency;

  const billsPct = bills / pay * 100;
  const subsPct  = subscriptions / pay * 100;
  const savPct   = savings / pay * 100;
  const b2  = billsPct;
  const s2  = b2 + subsPct;
  const sv2 = s2 + savPct;
  const donutBg = `conic-gradient(#ff6b5e 0% ${b2}%, #54a0ff ${b2}% ${s2}%, #feca57 ${s2}% ${sv2}%, rgba(140,143,156,0.28) ${sv2}% 100%)`;

  const stats = [
    { label: 'Bills',         value: bills,         color: '#ff6b5e' },
    { label: 'Subscriptions', value: subscriptions, color: '#54a0ff' },
    { label: 'Savings',       value: savings,       color: '#feca57' },
    { label: 'Leftover',      value: leftover,      color: 'var(--accent)' },
  ];

  const fieldStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--accent)',
    borderRadius: 8, color: 'var(--text)', outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      background: 'rgba(124,108,240,0.06)',
      borderRadius: 18, overflow: 'hidden',
    }}>
      {/* Section heading */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 26px',
        background: 'rgba(124,108,240,0.08)',
        borderBottom: '1px solid rgba(124,108,240,0.18)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)', flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>Pay Cycle</div>

        {/* Pending change banner inline */}
        {pendingPay && !editMode && (
          <div style={{
            marginLeft: 12, padding: '3px 10px', borderRadius: 7,
            background: 'rgba(254,202,87,0.1)', border: '1px solid rgba(254,202,87,0.25)',
            fontSize: 11.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span>⏳</span>
            Pay changes to <strong style={{ color: '#feca57', marginLeft: 4 }}>{fmtAUD(pendingPay.amount)}</strong>
            <span style={{ marginLeft: 4 }}>on {new Date(pendingPay.effectiveDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}</span>
          </div>
        )}
      </div>

      <div style={{ padding: '20px 26px' }}>
      <div style={{ display: 'flex', gap: 26, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Frequency label / pill toggle */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)' }}>
            PAY CYCLE
          </div>
          {editMode ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {Object.entries(FREQ_LABELS).map(([v, l]) => {
                const active = draftFreq === v;
                return (
                  <button key={v} onClick={() => setDraftFreq(v)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', letterSpacing: '0.04em',
                    border: active ? 'none' : '1px solid var(--line)',
                    background: active ? 'var(--accent)' : 'var(--surface2)',
                    color: active ? '#fff' : 'var(--muted)',
                  }}>{l}</button>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)', marginTop: 2 }}>
              {displayFreq.toUpperCase()}
            </div>
          )}

          {/* Pay amount */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginTop: 8 }}>
            {editMode ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="sg" style={{ fontWeight: 700, fontSize: 36, color: 'var(--muted)' }}>$</span>
                <input
                  value={draftPay}
                  onChange={e => setDraftPay(e.target.value.replace(/[^\d.]/g, ''))}
                  style={{ ...fieldStyle, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 40, lineHeight: 1, width: 180, padding: '2px 10px' }}
                />
              </div>
            ) : (
              <div className="sg" style={{ fontWeight: 700, fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {fmtAUD(displayPay)}
              </div>
            )}

            <div style={{ fontSize: 12.5, color: 'var(--muted)', paddingBottom: editMode ? 6 : 7 }}>
              next payday<br />
              {editMode ? (
                <input
                  type="date"
                  value={draftDate}
                  onChange={e => setDraftDate(e.target.value)}
                  style={{ ...fieldStyle, fontSize: 12.5, fontWeight: 700, padding: '3px 8px', marginTop: 2 }}
                />
              ) : (
                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{formatDate(nextPayday)}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '11px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</span>
                </div>
                <div className="sg" style={{ fontSize: 18, fontWeight: 600, marginTop: 3, color: s.color }}>
                  {fmtAUD(s.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut */}
        <div style={{ position: 'relative', width: 170, height: 170, flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: donutBg }} />
          <div style={{
            position: 'absolute', inset: 20, borderRadius: '50%',
            background: 'var(--bg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)' }}>FREE</div>
            <div className="sg" style={{ fontSize: 26, fontWeight: 700 }}>{fmtAUD(leftover)}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>of {fmtAUD(pay)}</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
