import React from 'react';
import { Bill } from '../types';
import { CATEGORIES, fmtAUD, ordinal } from '../utils';

interface Props {
  cat: typeof CATEGORIES[number];
  bills: Bill[];
  onAdd: () => void;
  onEdit: (bill: Bill) => void;
}

const sub: React.CSSProperties = { fontSize: 11.5, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

export default function Section({ cat, bills, onAdd, onEdit }: Props) {
  const { color, name, slug, noun } = cat;
  const isGoal = slug === 'savings';
  const total = bills.reduce((sum, b) => sum + b.perFortnight, 0);

  return (
    <div style={{ background: `${color}08`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
        background: `${color}12`, borderBottom: `1px solid ${color}25`,
      }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
        <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{name}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color, background: `${color}1a`, borderRadius: 6, padding: '2px 8px' }}>{bills.length}</div>
        <div style={{ flex: 1 }} />
        <div className="sg" style={{ fontWeight: 700, fontSize: 17, color }}>{fmtAUD(total)}/fn</div>
      </div>

      <div style={{ padding: '0 20px 12px' }}>
        {bills.map((b, i) => {
          const saved = b.goal_saved ?? 0;
          const pct = b.goal_target ? Math.min(100, Math.round(saved / b.goal_target * 100)) : 0;
          const detail = isGoal
            ? `${fmtAUD(b.perFortnight)}/fn`
            : [`${fmtAUD(b.amount)} ${b.frequency}`, b.due_day && `due ${ordinal(b.due_day)}`, b.notes].filter(Boolean).join(' · ');
          return (
            <div key={b.id} className="row" role="button" tabIndex={0} aria-label={`Edit ${b.name}`}
              onClick={() => onEdit(b)} onKeyDown={e => e.key === 'Enter' && onEdit(b)}
              style={{ padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${color}25` }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-name" style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                  <div style={sub}>{detail}</div>
                </div>
                {isGoal ? (
                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span className="sg" style={{ fontSize: 15, fontWeight: 600 }}>{fmtAUD(saved)}</span>
                    {b.goal_target ? <span style={{ fontSize: 12, color: 'var(--muted)' }}> of {fmtAUD(b.goal_target)}</span> : null}
                  </div>
                ) : (
                  <div className="sg" style={{ fontSize: 14.5, fontWeight: 600 }}>{fmtAUD(b.perFortnight)}</div>
                )}
              </div>
              {isGoal && b.goal_target ? (
                <div style={{ marginTop: 8, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: color, width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              ) : null}
            </div>
          );
        })}

        {bills.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0', textAlign: 'center' }}>Nothing here yet</div>
        )}

        <button onClick={onAdd} style={{
          width: '100%', marginTop: 6, padding: '8px 0', borderRadius: 8, background: 'transparent',
          border: `1px dashed ${color}60`, color, fontSize: 12.5, fontWeight: 600,
        }}>+ Add {noun}</button>
      </div>
    </div>
  );
}
