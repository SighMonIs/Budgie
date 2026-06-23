import React from 'react';

interface Props {
  theme: 'dark' | 'light';
  onThemeChange: (t: 'dark' | 'light') => void;
  activeNav: string;
  onNav: (n: string) => void;
  editMode: boolean;
  onEditToggle: () => void;
}

export default function AppBar({ theme, onThemeChange, activeNav, onNav, editMode, onEditToggle }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 22 }}>
      {/* Logo */}
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: '#fff', fontSize: 17,
        flexShrink: 0,
      }}>B</div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
        Budgie
      </div>

      <div style={{ flex: 1 }} />

      {/* Edit / Save button */}
      <button onClick={onEditToggle} style={{
        padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: 'none',
        background: editMode ? 'var(--accent)' : 'var(--surface2)',
        color: editMode ? '#fff' : 'var(--text)',
        outline: editMode ? 'none' : '1px solid var(--line)',
      }}>
        {editMode ? '✓ Save' : '✎ Edit'}
      </button>

      {/* Theme toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface2)', border: '1px solid var(--line)',
        borderRadius: 10, padding: 4,
      }}>
        {(['Dark', 'Light'] as const).map(t => {
          const active = (t.toLowerCase() as 'dark' | 'light') === theme;
          return (
            <button
              key={t}
              onClick={() => onThemeChange(t.toLowerCase() as 'dark' | 'light')}
              style={{
                padding: '4px 12px', borderRadius: 7, border: 'none', fontSize: 12, fontWeight: 600,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >{t}</button>
          );
        })}
      </div>
    </div>
  );
}
