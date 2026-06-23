import React from 'react';
import { Bill } from '../types';
import { fmtAUD } from '../utils';

interface Props {
  title: string;
  accentColor: string;
  items: Bill[];
  total: number;
  editMode?: boolean;
  onAdd?: () => void;
  onEdit?: (bill: Bill) => void;
  onEditCategory?: () => void;
}

export default function BillsSection({ title, accentColor, items, total, editMode, onAdd, onEdit, onEditCategory }: Props) {
  return (
    <div style={{
      background: `${accentColor}08`,
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px',
        background: `${accentColor}12`,
        borderBottom: `1px solid ${accentColor}25`,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: accentColor, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</div>
        {editMode && onEditCategory && (
          <button onClick={onEditCategory} title="Edit category" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: accentColor, fontSize: 14, padding: '0 2px', lineHeight: 1,
            opacity: 0.8,
          }}>✎</button>
        )}
        <div style={{
          fontSize: 11, fontWeight: 700, color: accentColor,
          background: `${accentColor}1a`, borderRadius: 6,
          padding: '2px 8px', letterSpacing: '0.02em',
        }}>{items.length}</div>
        <div style={{ flex: 1 }} />
        <div className="sg" style={{ fontWeight: 700, fontSize: 17, color: accentColor }}>{fmtAUD(total)}</div>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
      {items.map((item, i) => (
        <div
          key={item.id}
          onClick={() => editMode && onEdit?.(item)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '9px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            cursor: editMode && onEdit ? 'pointer' : 'default',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600 }}>{item.name}</div>
          <div style={{ flex: 1.4, minWidth: 0, fontSize: 11.5, color: 'var(--muted)' }}>
            {item.payee_name ?? '—'} · {item.account_name ?? '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', width: 60, textAlign: 'right' }}>
            {item.due_day ? `due ${item.due_day}th` : '—'}
          </div>
          {item.method === 'auto' ? (
            <div style={{
              fontSize: 9.5, fontWeight: 700, color: '#3ecf8e',
              background: 'rgba(62,207,142,0.13)', padding: '3px 8px', borderRadius: 5,
            }}>AUTO</div>
          ) : (
            <div style={{
              fontSize: 9.5, fontWeight: 700, color: 'var(--muted)',
              background: 'var(--surface2)', padding: '3px 8px', borderRadius: 5,
            }}>MANUAL</div>
          )}
          <div className="sg" style={{ fontSize: 14.5, fontWeight: 600, width: 58, textAlign: 'right' }}>
            {fmtAUD(item.perFortnight)}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0', textAlign: 'center' }}>
          No {title.toLowerCase()} yet
        </div>
      )}

      {editMode && onAdd && (
        <div style={{ borderTop: `1px solid ${accentColor}25`, marginTop: 4, paddingTop: 10 }}>
          <button onClick={onAdd} style={{
            width: '100%', padding: '8px 0', borderRadius: 8,
            background: 'transparent', border: `1px dashed ${accentColor}60`,
            color: accentColor, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.02em',
          }}>+ Add {title.slice(0, -1)}</button>
        </div>
      )}
      </div>
    </div>
  );
}
