import React, { useState } from 'react';
import { Totals } from '../types';
import { fmtAUD } from '../utils';
import { createFundAdjustment } from '../api';

interface Props {
  totals: Totals;
  initialTab?: 'add' | 'take';
  onClose: () => void;
  onDone: () => void;
}

const DESTINATIONS = ['Leftover to spend', 'Emergency Fund', 'Japan Trip'];

export default function AdjustFundsModal({ totals, initialTab = 'add', onClose, onDone }: Props) {
  const [tab, setTab] = useState<'add' | 'take'>(initialTab);
  const [amountStr, setAmountStr] = useState('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState(DESTINATIONS[0]);
  const [saving, setSaving] = useState(false);

  const amountCents = parseInt(amountStr || '0', 10) * 100;
  const newLeftover = tab === 'add'
    ? totals.leftover + amountCents
    : totals.leftover - amountCents;
  const delta = newLeftover - totals.leftover;
  const deltaColor = delta >= 0 ? '#3ecf8e' : '#ff6b5e';
  const deltaArrow = delta >= 0 ? '↑' : '↓';

  async function handleSubmit() {
    if (!amountCents) return;
    setSaving(true);
    try {
      await createFundAdjustment({ kind: tab, amount: amountCents, purpose, destination });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: '28px 30px',
        width: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 }}>Adjust funds</div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: 'var(--muted)', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--surface2)',
          border: '1px solid var(--line)', borderRadius: 10, padding: 4, gap: 4,
        }}>
          {(['add', 'take'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 0', borderRadius: 7, border: 'none',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>
              {t === 'add' ? '+ Add money' : '− Take out'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>AMOUNT</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '10px 16px', justifyContent: 'center',
          }}>
            <span className="sg" style={{ fontSize: 32, fontWeight: 700, color: 'var(--muted)' }}>$</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={e => setAmountStr(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 700,
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text)', width: 180, textAlign: 'center',
              }}
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>WHAT'S IT FOR?</div>
          <input
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="Freelance design — weekend job"
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Destination */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            {tab === 'add' ? 'WHERE SHOULD IT GO?' : 'WHERE FROM?'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DESTINATIONS.map(d => (
              <button key={d} onClick={() => setDestination(d)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                border: destination === d ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: destination === d ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: destination === d ? 'var(--text)' : 'var(--muted)',
              }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {amountCents > 0 && (
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>{fmtAUD(totals.leftover)}</span>
            <span style={{ fontSize: 18, color: 'var(--muted)' }}>→</span>
            <span className="sg" style={{ fontSize: 22, fontWeight: 700, color: deltaColor }}>
              {deltaArrow} {fmtAUD(newLeftover)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSubmit} disabled={!amountCents || saving} style={{
            flex: 2, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: amountCents ? 'var(--accent)' : 'var(--surface2)',
            color: amountCents ? '#fff' : 'var(--muted)',
            border: 'none', cursor: amountCents ? 'pointer' : 'default',
          }}>
            {tab === 'add' ? 'Add' : 'Take out'}{amountStr ? ` $${amountStr}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
