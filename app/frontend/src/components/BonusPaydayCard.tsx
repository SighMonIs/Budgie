import React, { useState } from 'react';
import { fmtAUD } from '../utils';

interface Props {
  payAmount: number;
  thirdPayMonth: string;
}

type Choice = 'save' | 'split' | 'spend';

export default function BonusPaydayCard({ payAmount, thirdPayMonth }: Props) {
  const [choice, setChoice] = useState<Choice>('save');

  const monthName = new Date(thirdPayMonth).toLocaleDateString('en-AU', { month: 'long' });

  const chips: { value: Choice; label: string }[] = [
    { value: 'save', label: 'Save it' },
    { value: 'split', label: 'Split' },
    { value: 'spend', label: 'Spend' },
  ];

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>✦ Bonus payday ahead</div>
      <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        {monthName} has a 3rd fortnightly pay — an extra {fmtAUD(payAmount)}.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {chips.map(c => (
          <button key={c.value} onClick={() => setChoice(c.value)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            background: choice === c.value ? 'var(--accent)' : 'var(--surface2)',
            color: choice === c.value ? '#fff' : 'var(--muted)',
            border: '1px solid var(--line)',
          }}>{c.label}</button>
        ))}
      </div>
    </div>
  );
}
