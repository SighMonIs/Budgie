# Budgie — Build Spec (data model, logic, API, Docker)

This complements `README.md`. It defines the backend and the budgeting logic so a developer can implement the app end-to-end. Currency is **AUD**; format with `Intl.NumberFormat('en-AU', { style:'currency', currency:'AUD' })` (or `$` + `toLocaleString('en-AU')` to match the mocks, which show whole-dollar figures).

## Core concept
The user is paid a fixed amount every **14 days**. Each pay, money is allocated into three buckets — **Bills**, **Subscriptions**, **Savings** — and whatever remains is **Leftover to spend**. Because bills recur on their own cadences (monthly, yearly, etc.), every bill is **normalised to a per-fortnight set-aside** so the dashboard can show "put aside $X this payday" consistently. Budgie is a planner, not a bank: it tells the user where to send money; it doesn't move it.

## Data model (SQLite)

```sql
-- Single-user app; keep a settings row for the income config.
CREATE TABLE settings (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  currency        TEXT    NOT NULL DEFAULT 'AUD',
  pay_amount      INTEGER NOT NULL,        -- net pay per cycle, in cents
  pay_frequency   TEXT    NOT NULL DEFAULT 'fortnightly', -- weekly|fortnightly
  next_payday     TEXT    NOT NULL,        -- ISO date of the next pay
  theme           TEXT    NOT NULL DEFAULT 'dark',
  accent          TEXT    NOT NULL DEFAULT '#7c6cf0'
);

CREATE TABLE accounts (             -- the user's own bank accounts (money comes FROM)
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL,              -- e.g. "Bank Account A"
  bsb   TEXT,
  number TEXT
);

CREATE TABLE payees (               -- who money is paid TO (optional bank details)
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,            -- e.g. "Ray White Real Estate"
  bsb     TEXT,
  number  TEXT,
  reference TEXT
);

CREATE TABLE bills (                -- bills, subscriptions AND savings goals share this table via `category`
  id            INTEGER PRIMARY KEY,
  category      TEXT NOT NULL,      -- 'bills' | 'subscriptions' | 'savings'
  name          TEXT NOT NULL,
  amount        INTEGER NOT NULL,   -- in cents, in the bill's native frequency
  frequency     TEXT NOT NULL,      -- weekly|fortnightly|monthly|quarterly|yearly  (for savings: contribution cadence)
  due_day       INTEGER,            -- day of month (1-31) or null
  due_date      TEXT,               -- specific ISO date for yearly/one-off, or null
  account_id    INTEGER REFERENCES accounts(id),  -- paid FROM
  payee_id      INTEGER REFERENCES payees(id),     -- paid TO (null for savings)
  method        TEXT NOT NULL DEFAULT 'auto',       -- 'auto' | 'manual'
  notes         TEXT,
  -- savings-goal extras (null for bills/subs):
  goal_target   INTEGER,            -- target amount in cents
  goal_saved    INTEGER,            -- amount saved so far in cents
  goal_deadline TEXT                -- optional ISO date
);

CREATE TABLE fund_adjustments (     -- one-off add/remove (side income, withdrawals)
  id          INTEGER PRIMARY KEY,
  kind        TEXT NOT NULL,        -- 'add' | 'take'
  amount      INTEGER NOT NULL,     -- cents
  purpose     TEXT,
  destination TEXT,                 -- 'leftover' | bill/goal id reference
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

> Bills, subscriptions, and savings goals deliberately share one `bills` table keyed by `category` — it keeps the allocation logic uniform. Split into separate tables only if you prefer.

## Sample seed data (matches the mockups)
- **Income:** pay_amount `318000` (=$3,180), fortnightly, next_payday `2026-06-25`.
- **Accounts:** "Bank Account A", "Bank Account B".
- **Bills (category=bills):** Rent $920/fn equiv (stored monthly $1,840, see normalisation) → Ray White RE / Bank A / auto / due 1st; Electricity & Gas $95 → AGL / Bank A / auto / 14th; Car insurance $75 → NRMA / Bank A / auto / 8th; Water $55 → Sydney Water / Bank B / **manual** / 20th; Phone $35 → Telstra / Bank A / auto / 5th. **Per-fortnight total ≈ $1,180.**
- **Subscriptions:** Netflix $28 (Bank B, auto, 12th); Spotify $13 (Bank B, auto, 3rd); Gym $44 (Anytime Fitness, Bank A, auto, 1st); Adobe CC $20 (Bank B, **manual**, 18th). **Total $105.**
- **Savings goals (per-fortnight contribution / saved / target):** Emergency Fund $250 · $4,200 / $10,000 (UBank Saver); Japan Trip $200 · $1,850 / $6,000 (UBank Saver); New Car $150 · $3,100 / $15,000 (ING Savings); Home Deposit $100 · $5,600 / $40,000 (ING Savings). **Total $700/fn.**
- **Leftover:** $3,180 − $1,180 − $105 − $700 = **$1,195**.

## Logic

### Frequency normalisation → per-fortnight set-aside
Convert any bill's native amount to the amount to reserve **each fortnight**:
```
factor = {
  weekly:      2,        // 2 weeks per fortnight
  fortnightly: 1,
  monthly:     12 / 26,  // 26 fortnights per year
  quarterly:   4  / 26,
  yearly:      1  / 26,
}[frequency]
perFortnight = round(amount * factor)
```
(Example: Rent stored monthly $1,840 → $1,840 × 12/26 ≈ **$849**. The mock shows $920 as an illustrative figure; use the formula as the source of truth and display the computed value.) Show this as the "↳ Budgie sets aside $X each fortnight" hint and use it for all dashboard totals and the donut.

### Payday allocation ("where to send my money")
On/after `next_payday`:
1. Sum per-fortnight set-asides by category → Bills, Subscriptions, Savings totals.
2. `leftover = pay_amount − (bills + subs + savings)`.
3. Produce a **transfer checklist**: group items by destination account/payee; for **manual** items surface the payee BSB / account / reference so the user can pay them; **auto** items are shown as "reserved, no action needed". (This checklist is the natural next screen — not yet designed, but the data supports it.)
4. Advance `next_payday` by 14 days when the user marks the pay as handled.

### 3rd-payday months
Fortnightly pay yields **3 paydays** in ~2 months per year. Detect when a calendar month contains three `next_payday + 14n` dates. On those, the 3rd pay's bills/subs are already covered by the prior two, so most of it is surplus. Offer the three actions from the mock — **Save it** (distribute across goals), **Split** (part savings / part leftover), **Spend** (all to leftover) — and apply the choice to that pay's allocation.

### Fund adjustments
`add` increases leftover (or a chosen goal's `goal_saved`); `take` decreases it. Record in `fund_adjustments` and reflect immediately in the dashboard leftover figure.

## REST API (suggested)
```
GET    /api/dashboard          -> { income, totals, bills, subscriptions, savings, leftover, calendar }
GET    /api/settings           PUT /api/settings           -- income, theme, accent
GET    /api/accounts           POST/PUT/DELETE /api/accounts/:id
GET    /api/payees             POST/PUT/DELETE /api/payees/:id
GET    /api/bills              POST/PUT/DELETE /api/bills/:id   -- ?category= filter
POST   /api/funds              -> create a fund adjustment
GET    /api/payday             -> computed allocation + transfer checklist for the current cycle
POST   /api/payday/confirm     -> advance next_payday, apply 3rd-pay choice
```
All money in **cents** over the wire; format in the UI.

## Docker / persistence
- Two services in `docker-compose.yml`: `web` (frontend build served statically or via the API) and `api` (Node). For a simple self-host, the Node API can also serve the built frontend — then a single service is fine.
- Mount a named volume for the SQLite file, e.g. `./data:/app/data`, and point the DB at `/app/data/budgie.sqlite` so **data persists across rebuilds**.
- Run DB migrations/seed on first boot if the file is absent.
- Example skeleton:
```yaml
services:
  budgie:
    build: .
    ports: ["8080:8080"]
    volumes:
      - ./data:/app/data
    environment:
      - DB_PATH=/app/data/budgie.sqlite
      - PORT=8080
    restart: unless-stopped
```

## Out of scope (confirmed with owner)
No bank sync, no multi-user/auth (single self-hosted user), no transaction import, no reporting/analytics beyond the dashboard. Keep it simple and visual.
