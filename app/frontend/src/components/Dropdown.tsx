import React, { useState } from 'react';
import DropdownItem from './DropdownItem';

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export default function Dropdown({ value, options, onChange, style }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative', minWidth: 0, ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10,
          padding: '10px 14px', color: 'var(--text)', fontSize: 13, cursor: 'pointer',
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.label ?? ''}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M1 1L5 5L9 1" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10,
            padding: 6, zIndex: 41, boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
          }}>
            {options.map(opt => (
              <DropdownItem
                key={opt.value}
                active={opt.value === value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >{opt.label}</DropdownItem>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
