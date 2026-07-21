import React, { useState } from 'react';

export interface Category {
  id?: number;
  slug?: string;
  name: string;
  color: string;
  type: 'debit' | 'credit';
}

interface Props {
  category?: Category;
  onClose: () => void;
  onDone: () => void;
}

const PRESET_COLORS = [
  '#ff6b5e', '#ff9f43', '#feca57', '#54a0ff',
  '#5f27cd', '#7c6cf0', '#3ecf8e', '#00d2d3',
  '#c8d6e5', '#8395a7',
];

export default function CategoryModal({ category, onClose, onDone }: Props) {
  const [name, setName]   = useState(category?.name ?? '');
  const [color, setColor] = useState(category?.color ?? '#7c6cf0');
  const [type, setType]   = useState<'debit' | 'credit'>(category?.type ?? 'debit');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    const payload = { name: name.trim(), color, type };
    onClose(); // close instantly
    if (category?.id) {
      fetch(`/api/categories/${category.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      }).then(onDone);
    } else {
      fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      }).then(onDone);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: '28px 30px',
        width: 420, boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>

        {/* Type — first, as it drives intent */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            TYPE
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([
              { value: 'debit',  label: '↓ Debit',  desc: 'Money going out — bills & subscriptions' },
              { value: 'credit', label: '↑ Credit', desc: 'Money set aside — savings goals' },
            ] as const).map(opt => (
              <button key={opt.value} onClick={() => setType(opt.value)} style={{
                flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: type === opt.value ? '1.5px solid var(--accent)' : '1px solid var(--line)',
                background: type === opt.value ? 'rgba(124,108,240,0.14)' : 'var(--surface2)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: type === opt.value ? 'var(--text)' : 'var(--muted)' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            NAME
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={type === 'debit' ? 'e.g. Bills' : 'e.g. Savings'}
            style={{
              width: '100%', background: 'var(--surface2)', border: '1px solid var(--line)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontSize: 14,
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Colour */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 8 }}>
            COLOUR
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: 7, background: c, border: 'none', cursor: 'pointer',
                  outline: color === c ? `3px solid var(--text)` : '3px solid transparent',
                  outlineOffset: 2,
                }}
              />
            ))}
            {/* Custom colour input */}
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              title="Custom colour"
              style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--line)', cursor: 'pointer', padding: 0 }}
            />
          </div>
          {/* Preview */}
          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface2)', borderRadius: 9, padding: '8px 12px',
            border: `1px solid ${color}40`,
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{name || 'Category name'}</span>
            <span style={{
              marginLeft: 'auto', fontSize: 10.5, fontWeight: 700,
              color, background: `${color}20`, borderRadius: 5, padding: '2px 8px',
            }}>{type === 'debit' ? 'DEBIT' : 'CREDIT'}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || saving} style={{
            flex: 2, padding: '11px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: name.trim() ? 'pointer' : 'default',
            background: name.trim() ? 'var(--accent)' : 'var(--surface2)',
            color: name.trim() ? '#fff' : 'var(--muted)',
          }}>Save category</button>
        </div>
      </div>
    </div>
  );
}
