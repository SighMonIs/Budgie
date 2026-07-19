import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
}

function uniqueSlug(db, name, excludeId) {
  const base = slugify(name);
  let slug = base;
  let n = 2;
  while (true) {
    const clash = excludeId
      ? db.prepare('SELECT id FROM categories WHERE slug=? AND id != ?').get(slug, excludeId)
      : db.prepare('SELECT id FROM categories WHERE slug=?').get(slug);
    if (!clash) return slug;
    slug = `${base}-${n++}`;
  }
}

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM categories ORDER BY sort_order, id').all());
});

router.patch('/:id/order', (req, res) => {
  const db = getDb();
  const { direction } = req.body;
  const all = db.prepare('SELECT id, sort_order FROM categories ORDER BY sort_order, id').all();
  const idx = all.findIndex(c => c.id === parseInt(req.params.id));
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (idx < 0 || swapIdx < 0 || swapIdx >= all.length) return res.json({ ok: true });
  const a = all[idx], b = all[swapIdx];
  db.prepare('UPDATE categories SET sort_order=? WHERE id=?').run(b.sort_order ?? b.id, a.id);
  db.prepare('UPDATE categories SET sort_order=? WHERE id=?').run(a.sort_order ?? a.id, b.id);
  res.json({ ok: true });
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, color, type } = req.body;
  const slug = uniqueSlug(db, name);
  const result = db.prepare('INSERT INTO categories (slug, name, color, type) VALUES (?, ?, ?, ?)').run(slug, name, color, type ?? 'debit');
  res.status(201).json({ id: result.lastInsertRowid, slug });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, color, type } = req.body;
  db.prepare('UPDATE categories SET name=?, color=?, type=? WHERE id=?').run(name, color, type, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM categories WHERE id=?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  const { n } = db.prepare('SELECT COUNT(*) as n FROM bills WHERE category=?').get(cat.slug);
  if (n > 0) return res.status(400).json({ error: `${n} bill${n === 1 ? '' : 's'} still use this category. Reassign or delete them first.` });
  db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
