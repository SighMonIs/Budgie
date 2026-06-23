# Handoff: Budgie — Personal Budgeting App

## Overview
Budgie is a self-hosted personal budgeting app for a single user paid a **fixed salary fortnightly** (every 2 weeks) in **AUD**. Its job is simple and visual: show this fortnight's pay at the top, then exactly where that money goes — split into colour-coded groups (Bills, Subscriptions, Savings) — and how much should be sitting in each savings goal. It also handles **adding/removing one-off funds** (side income, withdrawals) and the **"3rd payday" months** that fortnightly pay produces a few times a year.

This is intentionally **not** full accounting software. No transaction reconciliation, no bank sync, no double-entry ledger. It's a clear visual planner: *"on payday, here's where to send my money, and here's what I should have saved."*

### Target stack (specified by the product owner)
- **Frontend:** developer's choice of modern framework. **React + Vite + TypeScript** is recommended (the prototypes are React-flavoured and translate directly).
- **Backend:** **Node.js** (Express or Fastify) REST API.
- **Persistence:** **SQLite** (e.g. `better-sqlite3`). Data must survive restarts.
- **Deployment:** **Fully Dockerised** — ship a `docker-compose.yml` so the owner can `docker compose up` and self-host. SQLite file must live on a mounted volume so data persists between container rebuilds.

## About the Design Files
The files in this bundle (`Budgie Dashboard.dc.html`, `Budgie Flows.dc.html`, and the A/B comparison) are **design references created in HTML** — prototypes showing the intended look, layout, and interaction. They are **not production code to copy directly**. They use a small in-house templating runtime (`support.js`, the `<x-dc>` / `<sc-for>` tags); **do not** try to reuse that runtime.

The task is to **recreate these designs in a real codebase** — the recommended React + Vite + TS frontend (or the developer's preferred equivalent) — wired to the Node + SQLite backend, and package the whole thing with Docker. Match the visual design pixel-closely; build the data model and logic per the spec below.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, and interactions are all defined here and in `SPEC.md`. Recreate the UI faithfully using the chosen framework's component patterns. Exact hex values, fonts, and measurements are listed under **Design Tokens**.

---

## Screens / Views

### 1. Dashboard / Overview  (`Budgie Dashboard.dc.html`)
The home screen. Two-column layout: a flexible main column + a fixed **300px** right rail, max content width **1180px**, centered, **22px** gap between columns. App bar across the top.

**App bar** (full width, ~22px bottom padding):
- Left: 30×30 logo tile (9px radius, accent fill, white "B" in Space Grotesk 700/17px) + wordmark "Budgie" (Space Grotesk 700/20px) + nav links (Overview / Bills / Savings / Calendar; active link 13px 600 with 2px accent underline, inactive muted).
- Right: a **Dark / Light segmented toggle** (surface2 pill, 4px padding, active segment = accent fill white text), then the user identity ("Sam Whitfield" 12.5px 600 + "Fortnightly · AUD" 11px muted), then a 36×36 avatar tile.

**Main column** (top to bottom, 18px gap):

a) **Pay header + allocation donut** — one card (surface, 1px line border, 18px radius, 24–26px padding), flex row, 26px gap:
   - Left: label "PAY CYCLE · FORTNIGHTLY" (11px 700, 0.12em tracking, muted); the pay figure **$3,180** (Space Grotesk 700, 48px, -0.02em, text colour); beside it "next payday / Thu 25 Jun" (12.5px muted, date bolded in text colour). Below: a **2×2 grid** of stat tiles (surface2, 10px radius, 11×14px padding), each with a coloured 8px square + label + figure (Space Grotesk 18px 600): Bills `$1,180` (#ff6b5e), Subscriptions `$105` (#54a0ff), Savings `$700` (#feca57), Leftover `$1,195` (accent).
   - Right: a **170×170 donut** drawn with `conic-gradient`, segments proportional to the four amounts over total pay (Bills #ff6b5e → Subscriptions #54a0ff → Savings #feca57 → Leftover rgba(140,143,156,0.28)). Centre hole (inset 20px, surface fill) shows "FREE" (10px muted) / **$1,195** (Space Grotesk 26px 700) / "of $3,180" (10.5px muted).

b) **Bills section** — card with **3px left border #ff6b5e**, surface, 12px radius, 15×20px padding. Header row: title "Bills" (14px 700) + count "5 bills" (muted) + right-aligned total "$1,180" (Space Grotesk 16px 700, #ff6b5e). Then one row per bill (9px vertical padding, 1px top divider): bill name (13px 600) · meta "payee · account" (11.5px muted, flex 1.4) · due chip (11px muted, 60px right) · **AUTO** badge (9.5px 700, #3ecf8e on rgba(62,207,142,0.13), 5px radius) or **MANUAL** badge (muted on surface2) · amount (Space Grotesk 14.5px 600, 58px right).

c) **Subscriptions section** — identical structure, **3px left border #54a0ff**, total in #54a0ff.

d) **Savings goals section** — **3px left border #feca57**, total "$700/fn" in #feca57. Each goal row: name + meta ("UBank Saver · $250/fn") + saved/target ("$4,200" Space Grotesk + " of $10,000" muted), then a **6px progress bar** (surface2 track, #feca57 fill at the goal's percent).

**Right rail** (300px, 16px gap):
- **Adjust funds** card: "+ Add money" (accent fill, white) and "− Take out" (surface2, line border) buttons side by side + helper note.
- **Calendar** card: "June 2026" header + payday/due legend dots; 7-col weekday header (M T W T F S S); 7-col day grid, 30 cells. Payday cell (25) = accent fill, white, 700. Due-date cells (1,3,5,8,12,14,18,20) show a 4px #ff6b5e dot bottom-centre.
- **Bonus payday** card: "✦ Bonus payday ahead" + "August has a 3rd fortnightly pay — an extra $3,180." + three choice chips: **Save it** (accent, selected), Split, Spend (surface2).

### 2. Add / edit a bill  (modal, in `Budgie Flows.dc.html`)
540px modal card (surface, 18px radius, drop shadow). Header: "Add a bill" (Space Grotesk 18px 700) + subtitle "Budgie will set this aside each payday" + ✕ close tile. Footer: "Cancel" (outline) + "Save bill" (accent, flex 2). Body fields, top to bottom:
- **CATEGORY** — three selectable pills, each with a colour dot: Bills (#ff6b5e) / Subscriptions (#54a0ff) / Savings (#feca57). Selected pill = accent border + rgba(124,108,240,0.14) fill + text colour; unselected = line border + surface2 + muted.
- **BILL NAME** — text input (default "Rent").
- **AMOUNT** ($ prefix, Space Grotesk input) + **HOW OFTEN** (select: Monthly default; options Weekly/Fortnightly/Monthly/Quarterly/Yearly) on one row. Below, a derived hint: "↳ Budgie sets aside **$920** each fortnight" (see normalisation logic in SPEC).
- **DUE DATE** (select: day-of-month or specific date) + **PAID FROM** (account select: Bank Account A / B …) on one row.
- **PAYMENT METHOD** — two pills: ⚡ Automatic / ✋ Manual. Contextual note below: Automatic → "Paid automatically by your bank — Budgie just reserves it."; Manual → "You transfer this yourself. Budgie reminds you on the due date."
- **PAID TO** — text input (payee name, default "Ray White Real Estate").
- **Payee bank details · optional** — dashed-border surface2 box: **BSB** + **ACCOUNT NUMBER** on a row, then **REFERENCE** below (default "Tenancy 04-217"). Copy: "Store these so Budgie can show you exactly where to send the money."
- **NOTES** — text input (placeholder "e.g. lease ends Dec 2026").

### 3. Adjust funds  (modal, in `Budgie Flows.dc.html`)
460px modal card. Header "Adjust funds" + ✕. Body:
- **Tabs** — segmented "+ Add money" / "− Take out" (active = accent fill white).
- **AMOUNT** — large centred input, $ prefix, Space Grotesk 40px 700 (digits only).
- **WHAT'S IT FOR?** — text input (default "Freelance design — weekend job").
- **WHERE SHOULD IT GO? / WHERE FROM?** — label switches by tab. Destination chips: Leftover to spend / Emergency Fund / Japan Trip (single-select, selected = accent style).
- **Summary** — surface2 box showing current leftover "$1,195" struck-through → new leftover (Space Grotesk 22px 700), coloured **#3ecf8e** with ↑ when adding, **#ff6b5e** with ↓ when taking out. Updates live as the amount changes.
- Footer: Cancel + confirm button labelled "Add $250" / "Take out $250" (reflects tab + amount).

---

## Interactions & Behavior
- **Theme toggle** (dashboard): switches dark ⇄ light instantly across the whole UI. Dark is the default/primary.
- **Category / Payment-method / Tab / Destination selectors**: single-select; selected control takes the accent style; selecting updates dependent copy (method note, destination label, confirm label).
- **Amount → leftover preview** (Adjust funds): typing a digits-only amount recomputes the new leftover live (`1195 + amt` when adding, `1195 − amt` when taking out) and recolours the result.
- **Frequency → per-fortnight** (Add bill): the "set aside per fortnight" hint is derived from amount + frequency (see SPEC normalisation).
- No animations beyond instant state/colour changes and standard input focus. Inputs use a subtle focus outline (none drawn in mock; apply the codebase default or a 1px accent ring).
- **Responsive:** primary target is desktop web at ~1180px. On narrow widths the right rail should stack **below** the main column and sections go full-width; the dashboard cards already use flexible widths.

## State Management
Frontend (per the prototypes):
- Dashboard: `theme: 'dark' | 'light'`; accent colour (themeable, default `#7c6cf0`).
- Add bill: `category`, `frequency`, `dueDate`, `paidFromAccount`, `method`, plus form fields (name, amount, payee, payee BSB/account/reference, notes).
- Adjust funds: `tab: 'add' | 'take'`, `amount` (string, digits only), `purpose`, `destination`.

Backend data (fetched on load, mutated via the flows): income, accounts, payees, bills/recurring items, savings goals, and one-off fund adjustments. See **SPEC.md** for the full data model, REST endpoints, and the payday-allocation + 3rd-payday logic.

## Design Tokens

**Colours**
| Token | Dark (primary) | Light |
|---|---|---|
| `--bg` (page) | `#0f1014` | `#eceef6` |
| `--surface` (card) | `#1c1e25` | `#ffffff` |
| `--surface2` (nested) | `#23262f` | `#f3f5fb` |
| `--line` (border) | `rgba(255,255,255,0.06–0.08)` | `rgba(20,22,34,0.09)` |
| `--text` | `#f0f1f4` | `#1b1d29` |
| `--muted` | `#8b8f9c` | `#6a7186` |
| `--accent` | `#7c6cf0` | `#7c6cf0` |

**Category / status colours** (same both themes)
- Bills `#ff6b5e` · Subscriptions `#54a0ff` · Savings `#feca57`
- AUTO badge text `#3ecf8e` on `rgba(62,207,142,0.13)`
- Positive delta `#3ecf8e` · negative delta `#ff6b5e`
- Donut "leftover" slice `rgba(140,143,156,0.28)`

**Typography**
- Display / figures: **Space Grotesk** (400–700). Used for the pay figure, all dollar amounts, BSB/account numbers, donut centre.
- UI / body: **Manrope** (400–800).
- Scale: hero pay 48px/700; section donut centre 26px; stat figures 18px; modal title 18px; row amounts 14.5px; body 13–13.5px; labels 11–11.5px 700 with 0.04–0.12em tracking (muted).

**Radii** — cards 12–18px; inputs/pills 9–11px; tiles 10px; badges 5px; donut/dots 50%.
**Shadows** — modals `0 24px 60px rgba(0,0,0,0.5)`; dashboard frame `0 24px 60px rgba(0,0,0,0.45)`.
**Spacing** — column gap 22px; section padding 14–26px; field gap 12–16px; rail gap 16px.

## Assets
No external image or icon assets. The few glyphs used (✦ ✕ ⚡ ✋ ↑ ↓ ↳ ▾) are Unicode characters — replace with the codebase's icon set (e.g. Lucide) if preferred. The "B" logo is a typographic tile, not an image. Fonts load from Google Fonts (Space Grotesk, Manrope).

## Files
- `Budgie Dashboard.dc.html` — the approved primary dashboard (Direction B, "Ledger").
- `Budgie Flows.dc.html` — Add/edit bill + Adjust funds modals.
- `Budgie Dashboard — Directions (A vs B).dc.html` — original A/B comparison, for context only (B was chosen).
- `SPEC.md` — data model, sample data, payday-allocation logic, 3rd-payday handling, REST API, and Docker/SQLite notes.

> The `.dc.html` files open in a browser but rely on a sibling `support.js` runtime that is **not** included and **not** to be reused — they are visual references only. Read them for layout/markup/colour detail; rebuild in the target framework.
