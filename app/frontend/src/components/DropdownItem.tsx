import React, { useState } from 'react';

interface Props {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function DropdownItem({ active, onClick, children, style }: Props) {
  const [hovered, setHovered] = useState(false);
  const highlighted = active || hovered;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', border: 'none', cursor: 'pointer', borderRadius: 8,
        padding: '8px 10px', fontSize: 13, fontWeight: 600, textAlign: 'left',
        transition: 'background 0.12s, color 0.12s',
        ...style,
        background: highlighted ? 'rgba(124,108,240,0.14)' : 'transparent',
        color: highlighted ? 'var(--text)' : 'var(--muted)',
      }}
    >
      {children}
    </button>
  );
}
