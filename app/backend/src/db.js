import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/budgie.sqlite');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db;

export function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    migrate(db);
  }
  return db;
}

function migrate(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      id            INTEGER PRIMARY KEY CHECK (id = 1),
      currency      TEXT    NOT NULL DEFAULT 'AUD',
      pay_amount    INTEGER NOT NULL DEFAULT 318000,
      pay_frequency TEXT    NOT NULL DEFAULT 'fortnightly',
      next_payday   TEXT    NOT NULL DEFAULT '2026-06-25',
      theme                TEXT    NOT NULL DEFAULT 'dark',
      accent               TEXT    NOT NULL DEFAULT '#7c6cf0',
      pending_pay_amount   INTEGER,
      pending_pay_date     TEXT
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id     INTEGER PRIMARY KEY,
      name   TEXT NOT NULL,
      bsb    TEXT,
      number TEXT
    );

    CREATE TABLE IF NOT EXISTS payees (
      id        INTEGER PRIMARY KEY,
      name      TEXT NOT NULL,
      bsb       TEXT,
      number    TEXT,
      reference TEXT
    );

    CREATE TABLE IF NOT EXISTS bills (
      id          INTEGER PRIMARY KEY,
      category    TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      amount      INTEGER NOT NULL,
      frequency   TEXT    NOT NULL DEFAULT 'monthly',
      due_day     INTEGER,
      due_date    TEXT,
      account_id  INTEGER REFERENCES accounts(id),
      payee_id    INTEGER REFERENCES payees(id),
      method      TEXT    NOT NULL DEFAULT 'auto',
      notes       TEXT,
      goal_target INTEGER,
      goal_saved  INTEGER,
      goal_deadline TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id    INTEGER PRIMARY KEY,
      slug  TEXT UNIQUE,
      name  TEXT NOT NULL,
      color TEXT NOT NULL,
      type  TEXT NOT NULL DEFAULT 'debit'   -- 'debit' | 'credit'
    );

    CREATE TABLE IF NOT EXISTS fund_adjustments (
      id          INTEGER PRIMARY KEY,
      kind        TEXT    NOT NULL,
      amount      INTEGER NOT NULL,
      purpose     TEXT,
      destination TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bill_payments (
      id         INTEGER PRIMARY KEY,
      bill_id    INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
      amount     INTEGER NOT NULL,
      paid_date  TEXT,
      note       TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Add new columns to existing databases gracefully
  try { db.exec(`ALTER TABLE settings ADD COLUMN pending_pay_amount INTEGER`); } catch {}
  try { db.exec(`ALTER TABLE settings ADD COLUMN pending_pay_date TEXT`); } catch {}
  try { db.exec(`ALTER TABLE categories ADD COLUMN slug TEXT`); } catch {}

  // Seed categories if empty
  const catCount = db.prepare('SELECT COUNT(*) as n FROM categories').get();
  if (catCount.n === 0) {
    const ic = db.prepare('INSERT INTO categories (slug, name, color, type) VALUES (?, ?, ?, ?)');
    ic.run('bills',         'Bills',         '#ff6b5e', 'debit');
    ic.run('subscriptions', 'Subscriptions', '#54a0ff', 'debit');
    ic.run('savings',       'Savings',       '#feca57', 'credit');
  } else {
    // Backfill slugs for existing rows that don't have one
    const update = db.prepare(`UPDATE categories SET slug=? WHERE id=? AND (slug IS NULL OR slug='')`);
    const existing = db.prepare('SELECT id, name FROM categories').all();
    for (const row of existing) {
      const slug = row.name.toLowerCase().replace(/\s+/g, '-');
      update.run(slug, row.id);
    }
  }

  const count = db.prepare('SELECT COUNT(*) as n FROM settings').get();
  if (count.n === 0) seed(db);
}

function seed(db) {
  db.prepare(`INSERT INTO settings (id, pay_amount, next_payday) VALUES (1, 318000, '2026-06-25')`).run();

  const insertAccount = db.prepare('INSERT INTO accounts (name, bsb, number) VALUES (?, ?, ?)');
  const accA = insertAccount.run('Bank Account A', '062-000', '12345678').lastInsertRowid;
  const accB = insertAccount.run('Bank Account B', '062-001', '87654321').lastInsertRowid;

  const insertPayee = db.prepare('INSERT INTO payees (name, bsb, number, reference) VALUES (?, ?, ?, ?)');
  const rayWhite = insertPayee.run('Ray White Real Estate', '062-100', '11223344', 'Tenancy 04-217').lastInsertRowid;
  const agl      = insertPayee.run('AGL',             null, null, null).lastInsertRowid;
  const nrma     = insertPayee.run('NRMA',            null, null, null).lastInsertRowid;
  const sydWater = insertPayee.run('Sydney Water',    null, null, null).lastInsertRowid;
  const telstra  = insertPayee.run('Telstra',         null, null, null).lastInsertRowid;
  const netflix  = insertPayee.run('Netflix',         null, null, null).lastInsertRowid;
  const spotify  = insertPayee.run('Spotify',         null, null, null).lastInsertRowid;
  const anytime  = insertPayee.run('Anytime Fitness', null, null, null).lastInsertRowid;
  const adobe    = insertPayee.run('Adobe',           null, null, null).lastInsertRowid;
  const ubank    = insertPayee.run('UBank Saver',     null, null, null).lastInsertRowid;
  const ing      = insertPayee.run('ING Savings',     null, null, null).lastInsertRowid;

  const b = db.prepare(`INSERT INTO bills (category,name,amount,frequency,due_day,account_id,payee_id,method,goal_target,goal_saved) VALUES (?,?,?,?,?,?,?,?,?,?)`);

  b.run('bills', 'Rent',             184000, 'monthly',    1,  accA, rayWhite, 'auto',   null, null);
  b.run('bills', 'Electricity & Gas',  9500, 'monthly',   14,  accA, agl,      'auto',   null, null);
  b.run('bills', 'Car Insurance',      7500, 'monthly',    8,  accA, nrma,     'auto',   null, null);
  b.run('bills', 'Water',              5500, 'monthly',   20,  accB, sydWater, 'manual', null, null);
  b.run('bills', 'Phone',              3500, 'monthly',    5,  accA, telstra,  'auto',   null, null);

  b.run('subscriptions', 'Netflix',  2800, 'monthly', 12, accB, netflix, 'auto',   null, null);
  b.run('subscriptions', 'Spotify',  1300, 'monthly',  3, accB, spotify, 'auto',   null, null);
  b.run('subscriptions', 'Gym',      4400, 'monthly',  1, accA, anytime, 'auto',   null, null);
  b.run('subscriptions', 'Adobe CC', 2000, 'monthly', 18, accB, adobe,   'manual', null, null);

  const g = db.prepare(`INSERT INTO bills (category,name,amount,frequency,account_id,payee_id,method,goal_target,goal_saved) VALUES (?,?,?,?,?,?,?,?,?)`);
  g.run('savings', 'Emergency Fund', 25000, 'fortnightly', accA, ubank, 'auto', 1000000, 420000);
  g.run('savings', 'Japan Trip',     20000, 'fortnightly', accA, ubank, 'auto',  600000, 185000);
  g.run('savings', 'New Car',        15000, 'fortnightly', accA, ing,   'auto', 1500000, 310000);
  g.run('savings', 'Home Deposit',   10000, 'fortnightly', accA, ing,   'auto', 4000000, 560000);
}
