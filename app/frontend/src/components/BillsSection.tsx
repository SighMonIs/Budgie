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
  onMoveCategory?: (dir: 'up' | 'down') => void;
  onMoveItem?: (id: number, dir: 'up' | 'down') => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function OrderBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); if (!disabled) onClick(); }}
      disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 18, height: 16, borderRadius: 4, border: 'none',
        background: disabled ? 'transparent' : hovered ? 'var(--accent)' : 'var(--surface2)',
        color: disabled ? 'transparent' : hovered ? '#fff' : 'var(--muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, lineHeight: 1, padding: 0,
        transition: 'background 0.15s, color 0.15s',
        flexShrink: 0,
      }}
    >{children}</button>
  );
}

export default function BillsSection({ title, accentColor, items, total, editMode, onAdd, onEdit, onEditCategory, onMoveCategory, onMoveItem, isFirst, isLast }: Props) {
  return (
    <div style={{ background: `${accentColor}08`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px',
        background: `${accentColor}12`,
        borderBottom: `1px solid ${accentColor}25`,
      }}>
        {editMode && onMoveCategory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <OrderBtn onClick={() => onMoveCategory('up')} disabled={!!isFirst}>▲</OrderBtn>
            <OrderBtn onClick={() => onMoveCategory('down')} disabled={!!isLast}>▼</OrderBtn>
          </div>
        )}
        <span style={{ width: 10, height: 10, borderRadius: 3, background: accentColor, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</div>
        {editMode && onEditCategory && (
          <button onClick={onEditCategory} title="Edit category" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: accentColor, fontSize: 14, padding: '0 2px', lineHeight: 1, opacity: 0.8,
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
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
            }}
          >
            {editMode && onMoveItem && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                <OrderBtn onClick={() => onMoveItem(item.id, 'up')} disabled={i === 0}>▲</OrderBtn>
                <OrderBtn onClick={() => onMoveItem(item.id, 'down')} disabled={i === items.length - 1}>▼</OrderBtn>
              </div>
            )}
            <div
              onClick={() => editMode && onEdit?.(item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0,
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
                <div style={{ fontSize: 9.5, fontWeight: 700, color: '#3ecf8e', background: 'rgba(62,207,142,0.13)', padding: '3px 8px', borderRadius: 5 }}>AUTO</div>
              ) : (
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', background: 'var(--surface2)', padding: '3px 8px', borderRadius: 5 }}>MANUAL</div>
              )}
              <div className="sg" style={{ fontSize: 14.5, fontWeight: 600, width: 58, textAlign: 'right' }}>
                {fmtAUD(item.perFortnight)}
              </div>
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
