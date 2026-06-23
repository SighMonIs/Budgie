import React, { useState } from 'react';
import { Settings } from '../types';
import { fmtAUD } from '../utils';
import { updateSettings } from '../api';

interface Props {
  settings: Settings;
  onClose: () => void;
  onDone: () => void;
}

const FREQUENCIES = [
  { value: 'weekly',      label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly',     label: 'Monthly' },
];

export default function PayCycleModal({ settings, onClose, onDone }: Props) {
  const [payStr, setPayStr]         = useState(String(settings.pay_amount / 100));
  const [frequency, setFrequency]   = useState(settings.pay_frequency);
  const [nextPayday, setNextPayday] = useState(settings.next_payday);
  const [changeType, setChangeType] = useState<'now' | 'future'>('now');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [saving, setSaving] = useState(false);

  const payAmount = Math.round(parseFloat(payStr || '0') * 100);
  const payChanged = payAmount !== settings.pay_amount;
  const cycleChanged = frequency !== settings.pay_frequency || nextPayday !== settings.next_payday;
  const hasChanges = payChanged || cycleChanged;

  async function handleSave() {
    if (!payAmount || !nextPayday) return;
    setSaving(true);
    try {
      const useEffective = payChanged && changeType === 'future' && effectiveDate;
      await updateSettings({
        currency: settings.currency,
        pay_frequency: frequency,
        next_payday: nextPayday,
        theme: settings.theme,
        accent: settings.accent,
        // If change is immediate or there's no pay change, update pay_amount now
        pay_amount: useEffective ? settings.pay_amount : payAmount,
        pending_pay_amount: useEffective ? payAmount : null,
        pending_pay_date:   useEffective ? effectiveDate : null,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: '28px 30px',
        width: 500, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>
              Pay cycle
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>
              Update your income and schedule
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 16, color: 'var(--muted)', cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Pay amount */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            PAY AMOUNT (NET)
          </div>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface2)', border: '1px solid var(--line)',
            borderRadius: 10, padding: '10px 16px',
          }}>
            <span style={{ color: 'var(--muted)', marginRight: 4, fontSize: 18 }}>$</span>
            <input
              type="text"
              inputMode="decimal"
              value={payStr}
              onChange={e => setPayStr(e.target.value.replace(/[^\d.]/g, ''))}
              className="sg"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text)', fontSize: 28, fontWeight: 700,
              }}
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            FREQUENCY
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {FREQUENCIES.map(f => (
              <button key={f.value} onClick={() => setFrequency(f.value)} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: frequency === f.value ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: frequency === f.value ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: frequency === f.value ? 'var(--text)' : 'var(--muted)',
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Next payday */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            NEXT PAYDAY
          </div>
          <input
            type="date"
            value={nextPayday}
            min={today}
            onChange={e => setNextPayday(e.target.value)}
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14,
              outline: 'none', fontFamily: 'inherit',
              colorScheme: 'dark',
            }}
          />
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
            Budgie uses this to populate the calendar and calculate future paydays.
          </div>
        </div>

        {/* When does the pay change take effect? — only shown if pay amount changed */}
        {payChanged && (
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
              WHEN DOES THIS PAY CHANGE TAKE EFFECT?
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setChangeType('now')} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: changeType === 'now' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: changeType === 'now' ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: changeType === 'now' ? 'var(--text)' : 'var(--muted)',
              }}>Right away</button>
              <button onClick={() => setChangeType('future')} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: changeType === 'future' ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: changeType === 'future' ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
                color: changeType === 'future' ? 'var(--text)' : 'var(--muted)',
              }}>From a future date</button>
            </div>

            {changeType === 'future' && (
              <>
                <input
                  type="date"
                  value={effectiveDate}
                  min={today}
                  onChange={e => setEffectiveDate(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
                    borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14,
                    outline: 'none', fontFamily: 'inherit',
                    colorScheme: 'dark',
                  }}
                />
                {effectiveDate && (
                  <div style={{
                    marginTop: 10, padding: '10px 14px', borderRadius: 9,
                    background: 'rgba(124,108,240,0.1)', border: '1px solid rgba(124,108,240,0.25)',
                    fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5,
                  }}>
                    Dashboard will show <strong style={{ color: 'var(--text)' }}>{fmtAUD(settings.pay_amount)}</strong> until{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {new Date(effectiveDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </strong>
                    , then switch to <strong style={{ color: 'var(--accent)' }}>{fmtAUD(payAmount)}</strong>.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Existing pending change notice */}
        {settings.pending_pay_amount && settings.pending_pay_date && (
          <div style={{
            padding: '10px 14px', borderRadius: 9,
            background: 'rgba(254,202,87,0.1)', border: '1px solid rgba(254,202,87,0.25)',
            fontSize: 12.5, color: 'var(--muted)',
          }}>
            ⏳ Pending change: pay will become{' '}
            <strong style={{ color: '#feca57' }}>{fmtAUD(settings.pending_pay_amount)}</strong>{' '}
            on {new Date(settings.pending_pay_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
            Saving new values will replace this.
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
          }}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || !payAmount || saving || (changeType === 'future' && payChanged && !effectiveDate)}
            style={{
              flex: 2, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: hasChanges ? 'pointer' : 'default',
              background: hasChanges ? 'var(--accent)' : 'var(--surface2)',
              color: hasChanges ? '#fff' : 'var(--muted)',
            }}
          >Save changes</button>
        </div>
      </div>
    </div>
  );
}
