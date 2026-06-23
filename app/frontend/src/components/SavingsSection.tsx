import React from 'react';
import { Bill } from '../types';
import { fmtAUD } from '../utils';

interface Props {
  title?: string;
  items: Bill[];
  total: number;
  accentColor?: string;
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
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} disabled={disabled} style={{
      background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? 'transparent' : 'var(--muted)', padding: '0 1px', lineHeight: 1,
      fontSize: 11, display: 'flex', alignItems: 'center',
    }}>{children}</button>
  );
}

export default function SavingsSection({ title = 'Savings', items, total, accentColor = '#feca57', editMode, onAdd, onEdit, onEditCategory, onMoveCategory, onMoveItem, isFirst, isLast }: Props) {
  const COLOR = accentColor;
  return (
    <div style={{ background: `${COLOR}08`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 20px',
        background: `${COLOR}12`,
        borderBottom: `1px solid ${COLOR}25`,
      }}>
        {editMode && onMoveCategory && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <OrderBtn onClick={() => onMoveCategory('up')} disabled={!!isFirst}>▲</OrderBtn>
            <OrderBtn onClick={() => onMoveCategory('down')} disabled={!!isLast}>▼</OrderBtn>
          </div>
        )}
        <span style={{ width: 10, height: 10, borderRadius: 3, background: COLOR, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</div>
        {editMode && onEditCategory && (
          <button onClick={onEditCategory} title="Edit category" style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: COLOR, fontSize: 14, padding: '0 2px', lineHeight: 1, opacity: 0.8,
          }}>✎</button>
        )}
        <div style={{
          fontSize: 11, fontWeight: 700, color: COLOR,
          background: `${COLOR}1a`, borderRadius: 6,
          padding: '2px 8px', letterSpacing: '0.02em',
        }}>{items.length}</div>
        <div style={{ flex: 1 }} />
        <div className="sg" style={{ fontWeight: 700, fontSize: 17, color: COLOR }}>{fmtAUD(total)}/fn</div>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        {items.map((item, i) => {
          const saved = item.goal_saved ?? 0;
          const target = item.goal_target ?? 1;
          const pct = Math.min(100, Math.round(saved / target * 100));
          return (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${COLOR}25`,
              }}
            >
              {editMode && onMoveItem && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0, paddingTop: 2 }}>
                  <OrderBtn onClick={() => onMoveItem(item.id, 'up')} disabled={i === 0}>▲</OrderBtn>
                  <OrderBtn onClick={() => onMoveItem(item.id, 'down')} disabled={i === items.length - 1}>▼</OrderBtn>
                </div>
              )}
              <div
                onClick={() => editMode && onEdit?.(item)}
                style={{ flex: 1, minWidth: 0, cursor: editMode && onEdit ? 'pointer' : 'default' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 1 }}>
                      {item.account_name ?? 'Savings'} · {fmtAUD(item.perFortnight)}/fn
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="sg" style={{ fontSize: 15, fontWeight: 600 }}>{fmtAUD(saved)}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}> of {fmtAUD(target)}</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, background: COLOR, width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0', textAlign: 'center' }}>
            No savings goals yet
          </div>
        )}

        {editMode && onAdd && (
          <div style={{ borderTop: `1px solid ${COLOR}25`, marginTop: 4, paddingTop: 10 }}>
            <button onClick={onAdd} style={{
              width: '100%', padding: '8px 0', borderRadius: 8,
              background: 'transparent', border: `1px dashed ${COLOR}60`,
              color: COLOR, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '0.02em',
            }}>+ Add Goal</button>
          </div>
        )}
      </div>
    </div>
  );
}
