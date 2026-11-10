import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { addDays, perFortnight, todayISO } from './logic.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/budgie.sqlite');

let db;

export function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
    migrate(db);
  }
  return db;
}

export function migrate(db, today = todayISO()) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS settings (
      id          INTEGER PRIMARY KEY CHECK (id = 1),
      pay_amount  INTEGER NOT NULL DEFAULT 0,
      next_payday TEXT    NOT NULL,
      theme       TEXT    NOT NULL DEFAULT 'dark'
    );

    CREATE TABLE IF NOT EXISTS bills (
      id          INTEGER PRIMARY KEY,
      category    TEXT    NOT NULL,   -- 'bills' | 'subscriptions' | 'savings'
      name        TEXT    NOT NULL,
      amount      INTEGER NOT NULL,   -- cents, per \`frequency\`
      frequency   TEXT    NOT NULL DEFAULT 'monthly',
      due_day     INTEGER,
      notes       TEXT,
      goal_target INTEGER,            -- savings goals only
      goal_saved  INTEGER
    );

    CREATE TABLE IF NOT EXISTS fund_adjustments (
      id         INTEGER PRIMARY KEY,
      kind       TEXT    NOT NULL,
      amount     INTEGER NOT NULL,
      purpose    TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  if (!db.prepare('SELECT 1 FROM settings').get()) {
    db.prepare('INSERT INTO settings (id, next_payday) VALUES (1, ?)').run(addDays(today, 14));
  }

  if (db.prepare('PRAGMA user_version').get().user_version < 1) {
    migrateFromV0(db, today);
    db.exec('PRAGMA user_version = 1');
  }
}

// One-off upgrade from the old schema (custom categories, payees/accounts,
// "Historic" averages, unit+interval frequencies, pending pay). Old tables and
// columns are left in place, just no longer read.
function migrateFromV0(db, today) {
  const hasCol = (table, col) => db.prepare(`PRAGMA table_info(${table})`).all().some(r => r.name === col);
  const hasTable = name => !!db.prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name=?`).get(name);

  // Bills that used the "Historic" average keep that average as their fixed amount
  if (hasCol('bills', 'use_average') && hasTable('bill_payments')) {
    db.exec(`
      UPDATE bills SET
        amount = COALESCE((SELECT ROUND(AVG(p.amount)) FROM bill_payments p WHERE p.bill_id = bills.id), amount),
        use_average = 0
      WHERE use_average = 1
    `);
  }

  // Frequency is now one of weekly/fortnightly/monthly/quarterly/yearly
  if (hasCol('bills', 'frequency_interval')) {
    db.exec(`
      UPDATE bills SET frequency = 'fortnightly', frequency_interval = 1 WHERE frequency = 'weekly'  AND frequency_interval = 2;
      UPDATE bills SET frequency = 'quarterly',   frequency_interval = 1 WHERE frequency = 'monthly' AND frequency_interval = 3;
      UPDATE bills SET frequency = 'yearly',      frequency_interval = 1 WHERE frequency = 'monthly' AND frequency_interval = 12;
      UPDATE bills SET frequency = 'monthly' WHERE frequency = 'monthly_half';
    `);
    // Anything still unusual (e.g. "every 10 days"): store as the equivalent fortnightly amount
    const odd = db.prepare(`
      SELECT id, amount, frequency, frequency_interval FROM bills
      WHERE frequency NOT IN ('weekly','fortnightly','monthly','quarterly','yearly') OR frequency_interval != 1
    `).all();
    const fix = db.prepare(`UPDATE bills SET amount = ?, frequency = 'fortnightly', frequency_interval = 1 WHERE id = ?`);
    for (const b of odd) fix.run(perFortnight(b.amount, b.frequency, b.frequency_interval), b.id);
  }

  // Custom categories are gone: credit-type ones become 'savings', everything else 'bills'
  if (hasTable('categories')) {
    db.exec(`
      UPDATE bills SET category = CASE
        WHEN category IN ('bills', 'subscriptions', 'savings') THEN category
        WHEN category IN (SELECT slug FROM categories WHERE type = 'credit') THEN 'savings'
        ELSE 'bills'
      END
    `);
  }

  // Payee / account details become a free-text note, so nothing is lost
  if (hasCol('bills', 'payee_id') && hasTable('payees')) {
    const rows = db.prepare(`
      SELECT b.id, p.name AS payee, p.bsb, p.number, p.reference, a.name AS account
      FROM bills b
      LEFT JOIN payees p ON p.id = b.payee_id
      LEFT JOIN accounts a ON a.id = b.account_id
      WHERE (b.payee_id IS NOT NULL OR b.account_id IS NOT NULL) AND (b.notes IS NULL OR b.notes = '')
    `).all();
    const setNote = db.prepare('UPDATE bills SET notes = ? WHERE id = ?');
    for (const r of rows) {
      const note = [r.payee, r.bsb, r.number, r.reference, r.account && `from ${r.account}`].filter(Boolean).join(' · ');
      if (note) setNote.run(note, r.id);
    }
  }

  // The old app never advanced next_payday. Skip past stale dates without crediting goals.
  const s = db.prepare('SELECT next_payday FROM settings WHERE id = 1').get();
  let next = s.next_payday;
  while (next < today) next = addDays(next, 14);
  if (next !== s.next_payday) db.prepare('UPDATE settings SET next_payday = ? WHERE id = 1').run(next);
}
