import React, { useState } from 'react';
import { fmtAUD, toCents } from '../utils';
import { createFundAdjustment } from '../api';

interface Props {
  leftover: number;
  initialTab: 'add' | 'take';
  onClose: () => void;
  onDone: () => void;
}

export default function AdjustFundsModal({ leftover, initialTab, onClose, onDone }: Props) {
  const [tab, setTab] = useState(initialTab);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const cents = toCents(amount);
  const after = leftover + (tab === 'add' ? cents : -cents);

  async function submit() {
    setBusy(true);
    try { await createFundAdjustment({ kind: tab, amount: cents, purpose }); onDone(); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 'min(440px, 100%)' }}>
        <div className="sg" style={{ fontWeight: 700, fontSize: 18 }}>Adjust funds</div>

        <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 10, padding: 4, gap: 4 }}>
          {(['add', 'take'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', fontWeight: 600, fontSize: 13,
              background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--muted)',
            }}>{t === 'add' ? '+ Add money' : '− Take out'}</button>
          ))}
        </div>

        <div>
          <div className="label">AMOUNT</div>
          <input className="field sg" inputMode="decimal" autoFocus value={amount} placeholder="$0.00"
            onChange={e => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
            style={{ fontSize: 28, fontWeight: 700, textAlign: 'center' }} />
        </div>

        <div>
          <div className="label">WHAT'S IT FOR? (OPTIONAL)</div>
          <input className="field" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Freelance job" />
        </div>

        {cents > 0 && (
          <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Left over: {fmtAUD(leftover)} → <strong className="sg" style={{ fontSize: 18, color: after >= leftover ? 'var(--positive)' : 'var(--negative)' }}>{fmtAUD(after)}</strong>
          </div>
        )}

        {error && <div style={{ fontSize: 12.5, color: 'var(--negative)' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn primary" style={{ flex: 2 }} disabled={!cents || busy} onClick={submit}>
            {tab === 'add' ? 'Add' : 'Take out'}{cents ? ` ${fmtAUD(cents)}` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
