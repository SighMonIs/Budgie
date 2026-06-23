import React from 'react';
import { Bill } from '../types';
import { getPaydaysInMonth, getDueDates } from '../utils';

interface Props {
  nextPayday: string;
  bills: Bill[];
  subscriptions: Bill[];
}

export default function CalendarCard({ nextPayday, bills, subscriptions }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const monthName = now.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  // Mon-first offset
  const offset = (firstDay + 6) % 7;

  const paydays = new Set(getPaydaysInMonth(nextPayday, year, month));
  const dueDays = new Set(getDueDates([...bills, ...subscriptions], year, month));

  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{monthName}</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: 'var(--muted)' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginRight: 4 }} />Payday</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff6b5e', marginRight: 4 }} />Due</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--muted)', padding: '2px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const isPayday = paydays.has(day);
          const isDue = dueDays.has(day);
          return (
            <div key={i} style={{
              position: 'relative',
              textAlign: 'center', fontSize: 12, fontWeight: isPayday ? 700 : 400,
              padding: '5px 0',
              borderRadius: 6,
              background: isPayday ? 'var(--accent)' : 'transparent',
              color: isPayday ? '#fff' : 'var(--text)',
            }}>
              {day}
              {isDue && !isPayday && (
                <div style={{
                  position: 'absolute', bottom: 1, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: '#ff6b5e',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
