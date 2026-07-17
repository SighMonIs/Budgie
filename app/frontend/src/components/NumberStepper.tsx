import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  align?: 'center' | 'left';
  allowEmpty?: boolean;
  style?: React.CSSProperties;
}

export default function NumberStepper({ value, onChange, min, max, placeholder, align = 'left', allowEmpty, style }: Props) {
  function clamp(n: number): number {
    let clamped = n;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  }

  function step(delta: number) {
    if (value === '') {
      onChange(String(clamp(min ?? (delta > 0 ? 1 : 0))));
      return;
    }
    const current = parseInt(value, 10) || 0;
    onChange(String(clamp(current + delta)));
  }

  function handleBlur() {
    if (value === '') {
      if (!allowEmpty) onChange(String(min ?? 0));
      return;
    }
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) {
      onChange(allowEmpty ? '' : String(min ?? 0));
      return;
    }
    const clamped = clamp(n);
    if (clamped !== n) onChange(String(clamped));
  }

  const arrowBtnStyle: React.CSSProperties = {
    flex: 1, border: 'none', background: 'transparent', color: 'var(--muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', background: 'var(--surface2)',
      border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', ...style,
    }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode="numeric"
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text)', fontSize: 13, padding: align === 'center' ? '10px 0' : '10px 14px',
          textAlign: align,
        }}
      />
      <div style={{ width: 1, background: 'var(--line)', flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', width: 24, flexShrink: 0 }}>
        <button type="button" aria-label="Increase" onClick={() => step(1)}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          style={{ ...arrowBtnStyle, borderBottom: '1px solid var(--line)' }}>
          <svg width="9" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" aria-label="Decrease" onClick={() => step(-1)}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          style={arrowBtnStyle}>
          <svg width="9" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
