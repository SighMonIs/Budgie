// Run with: npm test   (node's built-in runner, no extra deps)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { migrate } from '../src/db.js';
import { perFortnight, rollPayday } from '../src/logic.js';

const fresh = (today = '2026-01-01') => {
  const db = new DatabaseSync(':memory:');
  migrate(db, today);
  return db;
};

test('perFortnight normalises every frequency', () => {
  assert.equal(perFortnight(10000, 'fortnightly'), 10000);
  assert.equal(perFortnight(10000, 'weekly'), 20000);
  assert.equal(perFortnight(100000, 'monthly'), 46027);
  assert.equal(perFortnight(36500, 'yearly'), 1400);
});

test('rollPayday credits every passed payday and advances next_payday', () => {
  const db = fresh();
  db.prepare("UPDATE settings SET next_payday = '2026-01-01'").run();
  db.prepare("INSERT INTO bills (category, name, amount, frequency, goal_saved) VALUES ('savings','Trip',10000,'fortnightly',500)").run();
  db.prepare("INSERT INTO bills (category, name, amount, frequency) VALUES ('bills','Rent',99999,'monthly')").run();

  rollPayday(db, '2025-12-31'); // not payday yet
  assert.equal(db.prepare('SELECT goal_saved FROM bills WHERE name=?').get('Trip').goal_saved, 500);

  rollPayday(db, '2026-01-30'); // paydays: 01-01, 01-15, 01-29
  assert.equal(db.prepare('SELECT goal_saved FROM bills WHERE name=?').get('Trip').goal_saved, 500 + 3 * 10000);
  assert.equal(db.prepare('SELECT next_payday FROM settings').get().next_payday, '2026-02-12');
  assert.equal(db.prepare('SELECT goal_saved FROM bills WHERE name=?').get('Rent').goal_saved, null);

  rollPayday(db, '2026-01-30'); // idempotent
  assert.equal(db.prepare('SELECT goal_saved FROM bills WHERE name=?').get('Trip').goal_saved, 30500);
});

test('migrating an old-schema database keeps the data', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE settings (id INTEGER PRIMARY KEY, pay_amount INTEGER, next_payday TEXT, theme TEXT DEFAULT 'dark');
    INSERT INTO settings VALUES (1, 318000, '2026-06-25', 'dark');
    CREATE TABLE categories (id INTEGER PRIMARY KEY, slug TEXT, name TEXT, color TEXT, type TEXT);
    INSERT INTO categories VALUES (1,'bills','Bills','#f00','debit'),(2,'transfer','Transfer','#0f0','credit'),(3,'test','Test','#00f','debit');
    CREATE TABLE payees (id INTEGER PRIMARY KEY, name TEXT, bsb TEXT, number TEXT, reference TEXT);
    INSERT INTO payees VALUES (1,'Landlord','062-000','1234','Unit 4');
    CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, bsb TEXT, number TEXT);
    INSERT INTO accounts VALUES (1,'Everyday',NULL,NULL);
    CREATE TABLE bills (
      id INTEGER PRIMARY KEY, category TEXT NOT NULL, name TEXT NOT NULL, amount INTEGER NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'monthly', frequency_interval INTEGER NOT NULL DEFAULT 1,
      due_day INTEGER, notes TEXT, account_id INTEGER, payee_id INTEGER,
      goal_target INTEGER, goal_saved INTEGER, use_average INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE bill_payments (id INTEGER PRIMARY KEY, bill_id INTEGER, amount INTEGER);
    INSERT INTO bills (id,category,name,amount,frequency,frequency_interval,payee_id,account_id) VALUES
      (1,'bills','Rent',184000,'monthly',1,1,1),
      (2,'transfer','Trip',20000,'weekly',2,NULL,NULL),
      (3,'test','Odd',5000,'daily',10,NULL,NULL),
      (4,'bills','Power',1,'monthly',3,NULL,NULL);
    UPDATE bills SET use_average = 1 WHERE id = 4;
    INSERT INTO bill_payments (bill_id, amount) VALUES (4, 9000), (4, 11000);
  `);

  migrate(db, '2026-11-10');
  const get = id => db.prepare('SELECT * FROM bills WHERE id=?').get(id);

  assert.equal(get(1).notes, 'Landlord · 062-000 · 1234 · Unit 4 · from Everyday');
  assert.deepEqual([get(2).category, get(2).frequency], ['savings', 'fortnightly']);
  assert.deepEqual([get(3).category, get(3).frequency, get(3).amount], ['bills', 'fortnightly', 7000]); // 5000 per 10 days
  assert.deepEqual([get(4).amount, get(4).frequency], [10000, 'quarterly']); // average of the logged payments
  // stale next_payday moves forward in 14-day steps, to today or later
  assert.equal(db.prepare('SELECT next_payday FROM settings').get().next_payday, '2026-11-12');

  migrate(db, '2030-01-01'); // runs once: a second call must not touch anything
  assert.equal(db.prepare('SELECT next_payday FROM settings').get().next_payday, '2026-11-12');
});
