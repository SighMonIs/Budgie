import React, { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  surroundingBg?: string;
}

const H_PAD = 4;
const TEXT_LEFT = 14;

export default function FloatingLabelInput({ value, onChange, label, placeholder, style, autoFocus, surroundingBg = 'var(--surface)' }: Props) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={floated ? placeholder : undefined}
        autoFocus={autoFocus}
        style={{
          width: '100%', background: 'var(--surface2)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--line)'}`,
          borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontSize: 14,
          outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s ease',
        }}
      />
      <label
        style={{
          position: 'absolute', left: TEXT_LEFT - H_PAD,
          top: floated ? 6 : '50%',
          transform: floated ? 'translateY(-100%)' : 'translateY(-50%)',
          padding: `0 ${H_PAD}px`,
          background: floated ? `linear-gradient(to bottom, ${surroundingBg} 0%, var(--surface2) 100%)` : 'transparent',
          fontSize: floated ? 11 : 14,
          fontWeight: floated ? 700 : 400,
          letterSpacing: floated ? '0.04em' : 'normal',
          color: focused ? 'var(--accent)' : 'var(--muted)',
          pointerEvents: 'none',
          transition: 'top 0.15s ease, font-size 0.15s ease, color 0.15s ease, letter-spacing 0.15s ease, background 0.15s ease',
        }}
      >{label}</label>
    </div>
  );
}
