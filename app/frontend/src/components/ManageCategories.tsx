import React, { useState, useEffect } from 'react';
import CategoryModal, { Category } from './CategoryModal';
import ConfirmModal from './ConfirmModal';

export default function ManageCategories() {
  const [open, setOpen]           = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal]         = useState<{ open: boolean; category?: Category }>({ open: false });
  const [confirmCat, setConfirmCat] = useState<Category | null>(null);

  async function load() {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  }

  useEffect(() => { if (open) load(); }, [open]);

  async function handleDelete(cat: Category) {
    await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
    setConfirmCat(null);
    load();
  }

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '10px 12px',
            background: 'var(--surface2)', border: 'none', cursor: 'pointer',
            color: 'var(--text)', fontSize: 13, fontWeight: 600, textAlign: 'left',
          }}
        >
          <span style={{ color: 'var(--accent)', fontSize: 15 }}>≡</span>
          Manage Categories
          <span style={{
            marginLeft: 'auto', color: 'var(--muted)', fontSize: 14,
            display: 'inline-block',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.2s',
          }}>→</span>
        </button>

        {open && (
          <div style={{ padding: '8px 0' }}>
            {categories.map((cat, i) => (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
                borderTop: i === 0 ? 'none' : '1px solid var(--line)',
              }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, flexShrink: 0, background: cat.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {cat.type}
                  </div>
                </div>
                <button
                  onClick={() => setModal({ open: true, category: cat })}
                  title="Edit"
                  style={{
                    color: 'var(--accent)', background: 'rgba(124,108,240,0.1)',
                    border: '1px solid rgba(124,108,240,0.2)',
                    borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13,
                  }}
                >✎</button>
                <button
                  onClick={() => setConfirmCat(cat)}
                  title="Delete"
                  style={{
                    color: '#ff6b5e', background: 'rgba(255,107,94,0.1)',
                    border: '1px solid rgba(255,107,94,0.2)',
                    borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 13,
                  }}
                >🗑</button>
              </div>
            ))}

            <div style={{ padding: '8px 12px 4px', borderTop: '1px solid var(--line)' }}>
              <button
                onClick={() => setModal({ open: true })}
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 8,
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                }}
              >+ Add Category</button>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <CategoryModal
          category={modal.category}
          onClose={() => setModal({ open: false })}
          onDone={() => { setModal({ open: false }); load(); }}
        />
      )}

      {confirmCat && (
        <ConfirmModal
          title={`Delete "${confirmCat.name}"?`}
          message="This category will be permanently removed."
          onConfirm={() => handleDelete(confirmCat)}
          onCancel={() => setConfirmCat(null)}
        />
      )}
    </>
  );
}
