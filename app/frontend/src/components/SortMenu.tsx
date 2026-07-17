import React, { useState } from 'react';
import { SortField, SortState } from '../utils';

interface Props {
  value: SortState | null;
  onChange: (value: SortState) => void;
  color: string;
}

const OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'due', label: 'Due Date' },
  { field: 'total', label: 'Total' },
];

export default function SortMenu({ value, onChange, color }: Props) {
  const [open, setOpen] = useState(false);

  function pick(field: SortField) {
    if (value?.field === field) {
      onChange({ field, dir: value.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onChange({ field, dir: 'asc' });
    }
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        title="Sort items"
        aria-label="Sort items"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: open ? color : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 4, borderRadius: 6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6,
            background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 12,
            padding: 6, minWidth: 150, boxShadow: '0 12px 28px rgba(0,0,0,0.35)', zIndex: 41,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', padding: '4px 8px 6px' }}>SORT BY</div>
            {OPTIONS.map(opt => {
              const active = value?.field === opt.field;
              return (
                <button
                  key={opt.field}
                  type="button"
                  className="dropdown-item"
                  onClick={() => pick(opt.field)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(124,108,240,0.14)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--muted)',
                    fontSize: 12.5, fontWeight: 600, textAlign: 'left',
                  }}
                >
                  {opt.label}
                  {active && (
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0 }}>
                      <path d={value!.dir === 'asc' ? 'M1 5L5 1L9 5' : 'M1 1L5 5L9 1'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
