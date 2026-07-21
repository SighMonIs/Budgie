import React, { useState, useEffect } from 'react';
import { Account, Payee } from '../types';
import ConfirmModal from './ConfirmModal';

interface Props {
  onClose: () => void;
}

type Tab = 'accounts' | 'payees';

const inputStyle: React.CSSProperties = {
  flex: 1, background: 'var(--surface2)', border: '1px solid var(--line)',
  borderRadius: 9, padding: '9px 12px', color: 'var(--text)', fontSize: 13,
  outline: 'none', minWidth: 0,
};

function AccountRow({ account, onSaved, onDelete }: { account: Account; onSaved: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [bsb, setBsb] = useState(account.bsb ?? '');
  const [number, setNumber] = useState(account.number ?? '');

  function save() {
    fetch(`/api/accounts/${account.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bsb: bsb || null, number: number || null }),
    }).then(() => { setEditing(false); onSaved(); });
  }

  if (editing) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line)' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Account name" style={inputStyle} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={bsb} onChange={e => setBsb(e.target.value)} placeholder="BSB" style={inputStyle} />
        <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Account number" style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDelete} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid #ff6b5e', color: '#ff6b5e', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={save} style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );

  return (
    <div onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{account.name}</div>
        {(account.bsb || account.number) && (
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
            {[account.bsb, account.number].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>✎</span>
    </div>
  );
}

function PayeeRow({ payee, onSaved, onDelete }: { payee: Payee; onSaved: () => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(payee.name);
  const [bsb, setBsb] = useState(payee.bsb ?? '');
  const [number, setNumber] = useState(payee.number ?? '');
  const [reference, setReference] = useState(payee.reference ?? '');

  function save() {
    fetch(`/api/payees/${payee.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bsb: bsb || null, number: number || null, reference: reference || null }),
    }).then(() => { setEditing(false); onSaved(); });
  }

  if (editing) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line)' }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Payee name" style={inputStyle} />
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={bsb} onChange={e => setBsb(e.target.value)} placeholder="BSB" style={inputStyle} />
        <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Account number" style={inputStyle} />
      </div>
      <input value={reference} onChange={e => setReference(e.target.value)} placeholder="Payment reference" style={inputStyle} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDelete} style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', border: '1px solid #ff6b5e', color: '#ff6b5e', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button onClick={save} style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Save</button>
      </div>
    </div>
  );

  return (
    <div onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--line)', cursor: 'pointer' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{payee.name}</div>
        {(payee.bsb || payee.number || payee.reference) && (
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
            {[payee.bsb, payee.number, payee.reference].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>✎</span>
    </div>
  );
}

export default function AccountsModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('accounts');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [addingAccount, setAddingAccount] = useState(false);
  const [addingPayee, setAddingPayee] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccBsb, setNewAccBsb] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newPayeeName, setNewPayeeName] = useState('');
  const [newPayeeBsb, setNewPayeeBsb] = useState('');
  const [newPayeeNumber, setNewPayeeNumber] = useState('');
  const [newPayeeRef, setNewPayeeRef] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'account' | 'payee'; id: number; name: string } | null>(null);

  const loadAccounts = () => fetch('/api/accounts').then(r => r.json()).then(setAccounts);
  const loadPayees  = () => fetch('/api/payees').then(r => r.json()).then(setPayees);

  useEffect(() => { loadAccounts(); loadPayees(); }, []);

  function addAccount() {
    if (!newAccName.trim()) return;
    fetch('/api/accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newAccName.trim(), bsb: newAccBsb || null, number: newAccNumber || null }),
    }).then(() => { setNewAccName(''); setNewAccBsb(''); setNewAccNumber(''); setAddingAccount(false); loadAccounts(); });
  }

  function addPayee() {
    if (!newPayeeName.trim()) return;
    fetch('/api/payees', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPayeeName.trim(), bsb: newPayeeBsb || null, number: newPayeeNumber || null, reference: newPayeeRef || null }),
    }).then(() => { setNewPayeeName(''); setNewPayeeBsb(''); setNewPayeeNumber(''); setNewPayeeRef(''); setAddingPayee(false); loadPayees(); });
  }

  function handleDelete() {
    if (!confirmDelete) return;
    const url = confirmDelete.type === 'account' ? `/api/accounts/${confirmDelete.id}` : `/api/payees/${confirmDelete.id}`;
    fetch(url, { method: 'DELETE' }).then(() => {
      setConfirmDelete(null);
      confirmDelete.type === 'account' ? loadAccounts() : loadPayees();
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'accounts', label: 'Bank Accounts' },
    { id: 'payees',   label: 'Payees' },
  ];

  return (
    <>
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '24px 0', overflowY: 'auto',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--surface)', borderRadius: 18, width: 500,
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', margin: 'auto', maxHeight: '80vh',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '22px 26px 0' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>Accounts & Payees</div>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ background: 'var(--surface2)', border: '1px solid var(--line)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--muted)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '14px 26px 0' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t.id ? 'var(--accent)' : 'var(--surface2)',
              color: tab === t.id ? '#fff' : 'var(--muted)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 26px 24px' }}>

          {tab === 'accounts' && (
            <>
              {accounts.map(a => (
                <AccountRow key={a.id} account={a} onSaved={loadAccounts}
                  onDelete={() => setConfirmDelete({ type: 'account', id: a.id, name: a.name })} />
              ))}
              {accounts.length === 0 && !addingAccount && (
                <div style={{ fontSize: 13, color: 'var(--muted)', padding: '16px 0', textAlign: 'center' }}>No bank accounts yet</div>
              )}
              {addingAccount ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--line)', marginTop: accounts.length ? 0 : 8 }}>
                  <input value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="Account name" style={inputStyle} autoFocus />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newAccBsb} onChange={e => setNewAccBsb(e.target.value)} placeholder="BSB (optional)" style={inputStyle} />
                    <input value={newAccNumber} onChange={e => setNewAccNumber(e.target.value)} placeholder="Number (optional)" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAddingAccount(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={addAccount} disabled={!newAccName.trim()} style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: newAccName.trim() ? 'var(--accent)' : 'var(--surface2)', color: newAccName.trim() ? '#fff' : 'var(--muted)', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: newAccName.trim() ? 'pointer' : 'default' }}>Add account</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingAccount(true)} style={{ marginTop: 12, width: '100%', padding: '9px 0', borderRadius: 9, background: 'transparent', border: '1px dashed rgba(124,108,240,0.4)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add bank account</button>
              )}
            </>
          )}

          {tab === 'payees' && (
            <>
              {payees.map(p => (
                <PayeeRow key={p.id} payee={p} onSaved={loadPayees}
                  onDelete={() => setConfirmDelete({ type: 'payee', id: p.id, name: p.name })} />
              ))}
              {payees.length === 0 && !addingPayee && (
                <div style={{ fontSize: 13, color: 'var(--muted)', padding: '16px 0', textAlign: 'center' }}>No payees yet</div>
              )}
              {addingPayee ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--line)', marginTop: payees.length ? 0 : 8 }}>
                  <input value={newPayeeName} onChange={e => setNewPayeeName(e.target.value)} placeholder="Payee name" style={inputStyle} autoFocus />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={newPayeeBsb} onChange={e => setNewPayeeBsb(e.target.value)} placeholder="BSB (optional)" style={inputStyle} />
                    <input value={newPayeeNumber} onChange={e => setNewPayeeNumber(e.target.value)} placeholder="Account number (optional)" style={inputStyle} />
                  </div>
                  <input value={newPayeeRef} onChange={e => setNewPayeeRef(e.target.value)} placeholder="Payment reference (optional)" style={inputStyle} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAddingPayee(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={addPayee} disabled={!newPayeeName.trim()} style={{ flex: 2, padding: '8px 0', borderRadius: 8, background: newPayeeName.trim() ? 'var(--accent)' : 'var(--surface2)', color: newPayeeName.trim() ? '#fff' : 'var(--muted)', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: newPayeeName.trim() ? 'pointer' : 'default' }}>Add payee</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingPayee(true)} style={{ marginTop: 12, width: '100%', padding: '9px 0', borderRadius: 9, background: 'transparent', border: '1px dashed rgba(124,108,240,0.4)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add payee</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>

    {confirmDelete && (
      <ConfirmModal
        title={`Delete "${confirmDelete.name}"?`}
        message={`This will remove the ${confirmDelete.type === 'account' ? 'bank account' : 'payee'} from Budgie. Bills using it will lose the association.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    )}
    </>
  );
}
