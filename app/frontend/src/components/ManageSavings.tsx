import React, { useState } from 'react';
import { Bill } from '../types';
import { fmtAUD } from '../utils';
import { deleteBill } from '../api';
import AddBillModal from './AddBillModal';

interface Props {
  savings: Bill[];
  onRefresh: () => void;
}

export default function ManageSavings({ savings, onRefresh }: Props) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; bill?: Bill }>({ open: false });

  async function handleDelete(bill: Bill) {
    if (!confirm(`Delete "${bill.name}"?`)) return;
    await deleteBill(bill.id);
    onRefresh();
  }

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Toggle row */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px',
            background: 'var(--surface2)', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontSize: 13, fontWeight: 600, textAlign: 'left',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: 15 }}>$</span>
          Manage Savings
          <span style={{
            marginLeft: 'auto', color: 'var(--muted)', fontSize: 14,
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}>→</span>
        </button>

        {open && (
          <div style={{ padding: '8px 0' }}>
            {savings.map((goal, i) => {
              const saved = goal.goal_saved ?? 0;
              const target = goal.goal_target ?? 0;
              const pct = target > 0 ? Math.min(100, Math.round(saved / target * 100)) : 0;

              return (
                <div key={goal.id} style={{
                  padding: '9px 12px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: '#feca57' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {goal.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {fmtAUD(saved)} of {fmtAUD(target)} · {fmtAUD(goal.perFortnight)}/fn
                      </div>
                    </div>
                    <button
                      onClick={() => setModal({ open: true, bill: goal })}
                      title="Edit"
                      style={{
                        color: 'var(--accent)', background: 'rgba(124,108,240,0.1)',
                        border: '1px solid rgba(124,108,240,0.2)',
                        borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13,
                      }}
                    >✎</button>
                    <button
                      onClick={() => handleDelete(goal)}
                      title="Delete"
                      style={{
                        color: '#ff6b5e', background: 'rgba(255,107,94,0.1)',
                        border: '1px solid rgba(255,107,94,0.2)',
                        borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13,
                      }}
                    >🗑</button>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 7, height: 4, borderRadius: 2, background: 'var(--surface2)' }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: '#feca57',
                      width: `${pct}%`, transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>{pct}% complete</div>
                </div>
              );
            })}

            {savings.length === 0 && (
              <div style={{ padding: '12px', fontSize: 12.5, color: 'var(--muted)', textAlign: 'center' }}>
                No savings goals yet.
              </div>
            )}

            <div style={{ padding: '8px 12px 4px', borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setModal({ open: true })}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 8,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                }}
              >+ Add Goal</button>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <AddBillModal
          bill={modal.bill ?? ({ category: 'savings' } as Bill)}
          onClose={() => setModal({ open: false })}
          onDone={() => { setModal({ open: false }); onRefresh(); }}
        />
      )}
    </>
  );
}
