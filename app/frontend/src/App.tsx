import React, { useState, useEffect, useCallback } from 'react';
import { Bill, CategorySlug, Dashboard } from './types';
import { fetchDashboard, updateSettings } from './api';
import { CATEGORIES } from './utils';
import PayHeader from './components/PayHeader';
import Section from './components/Section';
import CalendarCard from './components/CalendarCard';
import BillModal from './components/BillModal';
import AdjustFundsModal from './components/AdjustFundsModal';

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);
  const [billModal, setBillModal] = useState<{ bill?: Bill; category?: CategorySlug } | null>(null);
  const [fundsTab, setFundsTab] = useState<'add' | 'take' | null>(null);

  const load = useCallback(() => {
    fetchDashboard().then(d => { setData(d); setError(false); }).catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    document.documentElement.className = data?.theme === 'light' ? 'light' : '';
  }, [data?.theme]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>⚠️ Can't reach Budgie</div>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Make sure the backend is running.</div>
      <button className="btn primary" onClick={load}>Retry</button>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>
      Loading…
    </div>
  );

  const toggleTheme = () => {
    const theme = data.theme === 'dark' ? 'light' : 'dark';
    setData({ ...data, theme });
    updateSettings({ theme });
  };
  const done = () => { setBillModal(null); setFundsTab(null); load(); };

  return (
    <div className="page">
      <div className="layout">
        <main className="col" style={{ gap: 18 }}>
          <PayHeader data={data} onSaved={load} onToggleTheme={toggleTheme} />
          {CATEGORIES.map(cat => (
            <Section key={cat.slug} cat={cat}
              bills={data.bills.filter(b => b.category === cat.slug)}
              onAdd={() => setBillModal({ category: cat.slug })}
              onEdit={bill => setBillModal({ bill })} />
          ))}
        </main>

        <aside className="rail">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Adjust funds</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn primary" style={{ flex: 1 }} onClick={() => setFundsTab('add')}>+ Add money</button>
              <button className="btn" style={{ flex: 1, color: 'var(--text)' }} onClick={() => setFundsTab('take')}>− Take out</button>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Record side income or one-off withdrawals.</div>
          </div>
          <CalendarCard nextPayday={data.nextPayday} bills={data.bills.filter(b => b.category !== 'savings')} />
        </aside>
      </div>

      {billModal && (
        <BillModal bill={billModal.bill} defaultCategory={billModal.category} onClose={() => setBillModal(null)} onDone={done} />
      )}
      {fundsTab && (
        <AdjustFundsModal leftover={data.leftover} initialTab={fundsTab} onClose={() => setFundsTab(null)} onDone={done} />
      )}
    </div>
  );
}
