import React, { useState, useEffect, useCallback } from 'react';
import { DashboardData } from './types';
import { fetchDashboard } from './api';
import PayHeader from './components/PayHeader';
import BillsSection from './components/BillsSection';
import SavingsSection from './components/SavingsSection';
import CalendarCard from './components/CalendarCard';
import AdjustFundsModal from './components/AdjustFundsModal';
import AddBillModal from './components/AddBillModal';
import BonusPaydayCard from './components/BonusPaydayCard';
import CategoryModal, { Category } from './components/CategoryModal';
import SavingsChecklist from './components/SavingsChecklist';
import AccountsModal from './components/AccountsModal';
import { Bill } from './types';

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeNav, setActiveNav] = useState('Overview');
  const [adjustModal, setAdjustModal] = useState<{ open: boolean; tab: 'add' | 'take' }>({ open: false, tab: 'add' });
  const [billModal, setBillModal] = useState<{ open: boolean; bill?: Bill; defaultCategory?: string }>({ open: false });
  const [editMode, setEditMode] = useState(false);
  const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: Category }>({ open: false });
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountsModal, setAccountsModal] = useState(false);

  const loadCategories = useCallback(async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  }, []);

  const load = useCallback(async () => {
    try {
      const d = await fetchDashboard();
      setData(d);
      setTheme(d.settings.theme as 'dark' | 'light');
    } catch (e) {
      setError('Could not connect to Budgie API. Make sure the backend is running.');
    }
  }, []);

  const moveCategory = useCallback(async (id: number, dir: 'up' | 'down') => {
    await fetch(`/api/categories/${id}/order`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction: dir }) });
    loadCategories();
  }, [loadCategories]);

  const moveItem = useCallback(async (id: number, dir: 'up' | 'down') => {
    await fetch(`/api/bills/${id}/order`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction: dir }) });
    load();
  }, [load]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>⚠️ Backend not reachable</div>
      <div style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>{error}</div>
      <button onClick={load} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Retry</button>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 28px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1022 }}>
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
          {/* Main column */}
          <div style={{ width: 700, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <PayHeader
              totals={data.totals}
              nextPayday={data.nextPayday}
              frequency={data.settings.pay_frequency}
              pendingPay={data.pendingPay}
              editMode={editMode}
              onSaved={load}
              categories={categories}
            />

            {editMode && (
              <button onClick={() => setCategoryModal({ open: true })} style={{
                width: '100%', padding: '9px 0', borderRadius: 10,
                background: 'transparent', border: '1px dashed rgba(124,108,240,0.5)',
                color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                letterSpacing: '0.02em',
              }}>+ Add Category</button>
            )}

            {(() => {
              const n = categories.length;
              return categories.map((cat, idx) => {
                const isFirst = idx === 0;
                const isLast  = idx === n - 1;
                const commonProps = {
                  editMode,
                  onAdd:          () => setBillModal({ open: true, defaultCategory: cat.slug }),
                  onEdit:         (bill: Bill) => setBillModal({ open: true, bill }),
                  onEditCategory: () => setCategoryModal({ open: true, category: cat }),
                  onMoveCategory: (dir: 'up' | 'down') => moveCategory(cat.id!, dir),
                  onMoveItem:     (id: number, dir: 'up' | 'down') => moveItem(id, dir),
                  onContribute:   async (id: number) => { await fetch(`/api/bills/${id}/contribute`, { method: 'POST' }); load(); },
                  isFirst, isLast,
                };
                if (cat.slug === 'savings') {
                  return (
                    <SavingsSection key={cat.id}
                      title={cat.name}
                      accentColor={cat.color}
                      items={data.savings}
                      total={data.totals.savings}
                      {...commonProps}
                    />
                  );
                }
                const items = cat.slug === 'bills' ? data.bills : cat.slug === 'subscriptions' ? data.subscriptions : [];
                const total = cat.slug === 'bills' ? data.totals.bills : cat.slug === 'subscriptions' ? data.totals.subscriptions : 0;
                return (
                  <BillsSection key={cat.id}
                    title={cat.name}
                    accentColor={cat.color}
                    items={items}
                    total={total}
                    {...commonProps}
                  />
                );
              });
            })()}
          </div>

          {/* Right rail */}
          <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Edit + theme controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setEditMode(m => !m)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', border: 'none', letterSpacing: '0.01em',
                background: editMode
                  ? 'linear-gradient(135deg, #3ecf8e, #2db87a)'
                  : 'linear-gradient(135deg, #7c6cf0, #5a4fd4)',
                color: '#fff',
                boxShadow: editMode
                  ? '0 4px 14px rgba(62,207,142,0.45)'
                  : '0 4px 14px rgba(124,108,240,0.45)',
              }}>
                {editMode ? (
                  <><span style={{ fontSize: 16, marginRight: 8 }}>✓</span> Save changes</>
                ) : (
                  <><span style={{ fontSize: 16, marginRight: 8 }}>✎</span> Edit Details</>
                )}
              </button>
              <button
                onClick={() => {
                  const next = theme === 'dark' ? 'light' : 'dark';
                  setTheme(next);
                  fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: next }) });
                }}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{
                  flexShrink: 0, alignSelf: 'stretch', padding: '0 14px', borderRadius: 10,
                  border: '1px solid var(--line)', background: 'var(--surface2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {theme === 'dark' ? (
                  /* Sun — shown in dark mode to switch to light */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="12" y1="2" x2="12" y2="4"/>
                    <line x1="12" y1="20" x2="12" y2="22"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="2" y1="12" x2="4" y2="12"/>
                    <line x1="20" y1="12" x2="22" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  /* Moon — shown in light mode to switch to dark */
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>



            <div style={{
              background: 'var(--surface)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Adjust funds</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setAdjustModal({ open: true, tab: 'add' })} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
                }}>+ Add money</button>
                <button onClick={() => setAdjustModal({ open: true, tab: 'take' })} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: 'var(--surface2)', color: 'var(--text)',
                  border: '1px solid var(--line)', cursor: 'pointer',
                }}>− Take out</button>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                Record side income or one-off withdrawals.
              </div>
            </div>

            <button onClick={() => setAccountsModal(true)} style={{
              width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: 'var(--surface2)', border: '1px solid var(--line)',
              color: 'var(--text)', cursor: 'pointer',
            }}>🏦 Accounts & Payees</button>

            <CalendarCard
              nextPayday={data.nextPayday}
              bills={data.bills}
              subscriptions={data.subscriptions}
            />

            {data.nextThirdPay && (
              <BonusPaydayCard
                payAmount={data.totals.pay}
                thirdPayMonth={data.nextThirdPay}
              />
            )}

            <SavingsChecklist
              items={data.savings}
              nextPayday={data.nextPayday}
              onContribute={async (id) => { await fetch(`/api/bills/${id}/contribute`, { method: 'POST' }); load(); }}
            />
          </div>
        </div>
      </div>

      {adjustModal.open && (
        <AdjustFundsModal
          totals={data.totals}
          initialTab={adjustModal.tab}
          onClose={() => setAdjustModal({ open: false, tab: 'add' })}
          onDone={() => { setAdjustModal({ open: false, tab: 'add' }); load(); }}
        />
      )}

      {billModal.open && (
        <AddBillModal
          bill={billModal.bill}
          defaultCategory={billModal.defaultCategory}
          onClose={() => setBillModal({ open: false })}
          onDone={() => { setBillModal({ open: false }); load(); }}
        />
      )}

      {accountsModal && <AccountsModal onClose={() => setAccountsModal(false)} />}

      {categoryModal.open && (
        <CategoryModal
          category={categoryModal.category}
          onClose={() => setCategoryModal({ open: false })}
          onDone={() => loadCategories()}
        />
      )}
    </div>
  );
}
