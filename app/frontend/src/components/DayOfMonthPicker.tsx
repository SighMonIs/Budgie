import React, { useState } from 'react';
import { ordinal } from '../utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function DayOfMonthPicker({ value, onChange, style }: Props) {
  const [open, setOpen] = useState(false);
  const day = value ? parseInt(value, 10) : null;

  return (
    <div style={{ position: 'relative', flex: 1, ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
          border: day ? '1.5px solid var(--accent)' : '1px solid var(--line)',
          background: day ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
          color: day ? 'var(--text)' : 'var(--muted)',
        }}
      >
        {day ? `${ordinal(day)} day of the month` : 'Pick a day'}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 12,
            padding: 8, zIndex: 41, boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {DAYS.map(d => (
                <button
                  key={d}
                  type="button"
                  className="dropdown-item"
                  onClick={() => { onChange(String(d)); setOpen(false); }}
                  style={{
                    padding: '7px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, textAlign: 'center',
                    background: day === d ? 'rgba(124,108,240,0.14)' : 'transparent',
                    color: day === d ? 'var(--text)' : 'var(--muted)',
                  }}
                >{d}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
