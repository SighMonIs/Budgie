import React, { useState, useEffect } from 'react';
import { Dashboard } from '../types';
import { fmtAUD, toCents } from '../utils';
import { updateSettings } from '../api';

interface Props {
  data: Dashboard;
  onSaved: () => void;
  onToggleTheme: () => void;
}

// Pay amount and next payday are edited in place: change the field, it saves.
export default function PayHeader({ data, onSaved, onToggleTheme }: Props) {
  const [payStr, setPayStr] = useState(String(data.pay / 100));
  useEffect(() => setPayStr(String(data.pay / 100)), [data.pay]);

  const save = (patch: Record<string, unknown>) => updateSettings(patch).then(onSaved);
  const savePay = () => { const c = toCents(payStr); if (c !== data.pay) save({ pay_amount: c }); };

  return (
    <div style={{ background: 'rgba(124,108,240,0.06)', borderRadius: 18, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 26px',
        background: 'rgba(124,108,240,0.08)', borderBottom: '1px solid rgba(124,108,240,0.18)',
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent)' }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', flex: 1 }}>Fortnightly pay</div>
        <button onClick={onToggleTheme} title="Switch light/dark" className="btn" style={{ padding: '4px 10px', fontSize: 15 }}>
          {data.theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      <div style={{ padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div className="sg" style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 44, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--muted)', marginRight: 2 }}>$</span>
            <input className="inline-edit sg" inputMode="decimal" title="Click to change your pay"
              value={payStr}
              onChange={e => setPayStr(e.target.value.replace(/[^\d.]/g, ''))}
              onBlur={savePay} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
              style={{ width: `${Math.max(payStr.length, 4) + 1}ch`, padding: '0 6px' }} />
          </div>
          <label style={{ fontSize: 12.5, color: 'var(--muted)', paddingBottom: 8 }}>
            next payday<br />
            <input type="date" className="inline-edit" title="Click to change" value={data.nextPayday}
              onChange={e => e.target.value && save({ next_payday: e.target.value })}
              style={{ color: 'var(--text)', fontWeight: 700, fontSize: 13, padding: '2px 6px', marginLeft: -6 }} />
          </label>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <Stat label="SET ASIDE" value={fmtAUD(data.setAside)} />
          <Stat label="LEFT OVER" value={fmtAUD(data.leftover)} color={data.leftover < 0 ? 'var(--negative)' : 'var(--positive)'} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</div>
      <div className="sg" style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
