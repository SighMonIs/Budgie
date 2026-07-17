import React, { useState } from 'react';

interface Props {
  direction: 'up' | 'down';
  onClick: () => void;
  disabled?: boolean;
}

export default function CategoryOrderButton({ direction, onClick, disabled }: Props) {
  const [hovered, setHovered] = useState(false);
  const path = direction === 'up' ? 'M1 7L6 2L11 7' : 'M1 2L6 7L11 2';

  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={direction === 'up' ? 'Move up' : 'Move down'}
      style={{
        width: 16, height: 12, border: 'none', background: 'transparent', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0 : hovered ? 1 : 0.5,
        transform: hovered && !disabled ? 'scale(1.25)' : 'scale(1)',
        transition: 'opacity 0.15s, transform 0.15s',
      }}
    >
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
        <path d={path} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
