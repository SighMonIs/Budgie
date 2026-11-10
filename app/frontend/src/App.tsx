import React, { useState, useEffect, useCallback } from 'react';
import { Bill, Dashboard } from './types';
import { fetchDashboard, updateSettings } from './api';
import { CATEGORIES } from './utils';
import PayHeader from './components/PayHeader';
import Section from './components/Section';
import BillModal from './components/BillModal';

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState(false);
  const [billModal, setBillModal] = useState<{ bill?: Bill } | null>(null);

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
  const done = () => { setBillModal(null); load(); };

  return (
    <div className="page">
      <main className="col">
        <PayHeader data={data} onSaved={load} onToggleTheme={toggleTheme} onAdd={() => setBillModal({})} />
        {CATEGORIES.map(cat => (
          <Section key={cat.slug} cat={cat}
            bills={data.bills.filter(b => b.category === cat.slug)}
            onEdit={bill => setBillModal({ bill })} />
        ))}
      </main>

      {billModal && <BillModal bill={billModal.bill} onClose={() => setBillModal(null)} onDone={done} />}
    </div>
  );
}
