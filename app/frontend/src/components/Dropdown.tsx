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
  label?: string;
  surroundingBg?: string;
  style?: React.CSSProperties;
}

const H_PAD = 4;

export default function Dropdown({ value, options, onChange, label, surroundingBg = 'var(--surface)', style }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const floated = open || (!!value && !!selected);

  return (
    <div style={{ position: 'relative', minWidth: 0, ...style }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface2)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--line)'}`,
          borderRadius: 10,
          padding: label ? '13px 14px' : '10px 14px', color: 'var(--text)', fontSize: label ? 14 : 13,
          cursor: 'pointer', transition: 'border-color 0.15s ease',
        }}
      >
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label && !floated ? '' : (selected?.label ?? '')}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <path d="M1 1L5 5L9 1" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {label && (
        <label
          style={{
            position: 'absolute', left: 10,
            top: floated ? 6 : '50%',
            transform: floated ? 'translateY(-100%)' : 'translateY(-50%)',
            padding: `0 ${H_PAD}px`,
            background: floated ? `linear-gradient(to bottom, ${surroundingBg} 0%, var(--surface2) 100%)` : 'transparent',
            fontSize: floated ? 11 : 14,
            fontWeight: floated ? 700 : 400,
            letterSpacing: floated ? '0.04em' : 'normal',
            color: open ? 'var(--accent)' : 'var(--muted)',
            pointerEvents: 'none',
            transition: 'top 0.15s ease, font-size 0.15s ease, color 0.15s ease, letter-spacing 0.15s ease, background 0.15s ease',
          }}
        >{label}</label>
      )}

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
