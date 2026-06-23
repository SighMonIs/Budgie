import React, { useState } from 'react';
import { Bill } from '../types';
import { fmtAUD } from '../utils';

interface Props {
  items: Bill[];
  nextPayday: string;
  onContribute: (id: number) => Promise<void>;
}

export default function SavingsChecklist({ items, nextPayday, onContribute }: Props) {
  const pending = items.filter(
    b => b.savings_mode === 'manual' &&
      (!b.last_contributed_at || b.last_contributed_at < nextPayday)
  );

  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const [completing, setCompleting] = useState<Set<number>>(new Set());

  const visible = pending.filter(b => !dismissed.has(b.id));

  if (visible.length === 0) return null;

  async function contribute(id: number) {
    setCompleting(s => new Set(s).add(id));
    await onContribute(id);
    setCompleting(s => { const n = new Set(s); n.delete(id); return n; });
  }

  async function markAll() {
    for (const item of visible) await contribute(item.id);
  }

  function dismissAll() {
    setDismissed(new Set(visible.map(b => b.id)));
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--line)',
        background: 'rgba(254,202,87,0.07)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Savings due</span>
        <span style={{
          fontSize: 10.5, fontWeight: 700, color: '#feca57',
          background: 'rgba(254,202,87,0.15)', borderRadius: 5, padding: '2px 7px',
        }}>{visible.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {visible.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            borderTop: i === 0 ? 'none' : '1px solid var(--line)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                {fmtAUD(item.perFortnight)}/fn
              </div>
            </div>
            <button
              onClick={() => contribute(item.id)}
              disabled={completing.has(item.id)}
              title="Mark as contributed"
              style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'rgba(62,207,142,0.15)', color: '#3ecf8e',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, flexShrink: 0,
              }}
            >✓</button>
            <button
              onClick={() => setDismissed(s => new Set(s).add(item.id))}
              title="Skip this time"
              style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--line)',
                background: 'var(--surface2)', color: 'var(--muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, flexShrink: 0,
              }}
            >✕</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--line)' }}>
        <button onClick={markAll} style={{
          flex: 2, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: '#3ecf8e', color: '#fff', fontSize: 12, fontWeight: 700,
        }}>✓ Mark all done</button>
        <button onClick={dismissAll} style={{
          flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--line)',
          color: 'var(--muted)', fontSize: 12, fontWeight: 600,
        }}>Skip all</button>
      </div>
    </div>
  );
}
