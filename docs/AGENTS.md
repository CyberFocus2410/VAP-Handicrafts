# AGENTS.md — Operating Manual for AI Coding Agents

This file tells any AI agent (Antigravity agents, Claude, Gemini, or others) **how to work on this repository**.
Read it fully at the start of every session. It is intentionally tool-agnostic.

---

## 1. Mission

Build a **premium 3D ecommerce store** for shell jewellery, personalized gifts and keepsakes (India, INR, UPI via Paytm), deployed on Vercel — as specified in [`PRD.md`](./PRD.md).

> Guiding principle (PRD §29): *create an experience customers remember, and an ecommerce system the business can depend on.*

The product is **not** a landing page, a mockup, or a generic ecommerce template.

---

## 2. Read Order (every session)

1. `AGENTS.md` (this file)
2. `RULES.md` — non-negotiable constraints
3. `MEMORY.md` — current state, what's done, what's next, open blockers
4. `DECISIONS.md` — settled choices (do not relitigate without a new ADR)
5. `PLAN.md` — the active phase and its acceptance criteria
6. `ARCHITECTURE.md` and `DESIGN.md` — as relevant to the task
7. `PRD.md` — consult the cited `§` for any requirement; **it is the source of truth**

If documents conflict: **PRD > RULES > DECISIONS > ARCHITECTURE/DESIGN > PLAN > MEMORY.**
Log any conflict you find in `DECISIONS.md`; do not silently pick one.

---

## 3. Working Protocol

### 3.1 Before you write code
1. Inspect the repo: `git status`, `ls`, `package.json`, existing routes/components.
2. Identify what already exists and **why** before changing it. Never overwrite working code without understanding its purpose.
3. State which PRD sections and plan items the task maps to.
4. If a required credential, asset, or business decision is missing → **stop that sub-task**, record it in `DECISIONS.md` (Owner Decisions), build the isolated integration layer, and continue with unblocked work.

### 3.2 While you work
- **One phase at a time.** Do not start Phase N+1 until Phase N's acceptance criteria are demonstrated.
- **Small, reviewable commits** with conventional messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).
- **Tests alongside business logic** — not after. Money, state machines, validation, idempotency always ship with tests.
- Keep the app **deployable at every milestone** (`npm run build` must pass before you finish).
- Prefer boring, well-supported libraries. Adding a dependency requires a one-line justification in the PR/commit and, for anything architectural, an ADR.

### 3.3 Before you finish a task
Run, and paste real output of:
```bash
npm run typecheck && npm run lint && npm run test && npm run build
```
(+ `npm run test:e2e` when UI flows changed.)
Then update `MEMORY.md` (state + next steps) and `DECISIONS.md` (any new decision).

### 3.4 Honesty rules (critical)
- **Never claim something works unless you ran it and saw it work.** UI existing ≠ feature working.
- Distinguish explicitly: ✅ *implemented & tested* · 🟡 *implemented, untested / dev-only* · ⛔ *not implemented / blocked on credentials*.
- Never claim Paytm, Resend, Supabase, or Vercel integrations work without a real successful run against that service's test environment. Otherwise label **"NOT VERIFIED AGAINST LIVE SERVICE"**.
- Never fabricate: prices, stock, reviews, sales numbers, certifications, GSTIN, tax rates, policy text, product claims, or "handmade" claims.
- If a test fails, report it. Do not delete or weaken a test to get green. Do not mark a TODO as done.

---

## 4. Agent Roles (for multi-agent / Manager View use)

Use these as **scoped work assignments**. An agent should stay in its lane and hand off through `MEMORY.md`.

| Role | Owns | Must not |
|---|---|---|
| **Architect / Lead** | Plan, ADRs, folder structure, integration contracts, phase gating, reviewing others' PRs | Implement features in parallel with others without a contract |
| **Frontend & Design-System** | `components/ui`, tokens, layout, responsive, a11y, forms UI | Put business logic or price math in components |
| **Motion & 3D** | R3F scenes, Framer Motion, reduced-motion, WebGL fallback, perf budgets | Block interaction, add GSAP without ADR, ship unlazy 3D |
| **Catalogue & Data** | Migrations, RLS, seed, data-access, search, product pages | Hardcode catalogue in components; skip RLS |
| **Commerce Core** | Cart validation, pricing, shipping, order creation, stock, state machines | Trust client totals; mutate payment state outside the state machine |
| **Payments** | `PaymentProvider` interface, Paytm adapter, callbacks, reconciliation, simulator | Invent endpoints; let simulator reach production; mark paid without server verification |
| **Messaging & Admin** | Outbox, email templates, admin UI, audit logs, authz | Send email inline in the payment transaction; expose admin by hidden link only |
| **QA & Security** | Test strategy, E2E, a11y, authz/IDOR/price-tamper/upload-abuse tests, dependency audit | Weaken tests to pass |

Cross-role contracts (types in `src/server/**/contracts.ts`) must be agreed **before** parallel work begins.

---

## 5. Task Brief Template

Use this when delegating or starting work:

```
TASK: <one sentence>
PHASE: <1-7>   PRD REFS: §…   PLAN ITEM: …
CONTEXT FILES: <paths>
IN SCOPE: …
OUT OF SCOPE: …
ACCEPTANCE:
  - [ ] …
TESTS REQUIRED: …
BLOCKERS / MISSING INPUTS: …
```

---

## 6. Phase Report Format (PRD §28.5 — mandatory at end of every phase)

```
## Phase N Report
**Implemented:** …
**Files created / modified:** …
**Tests run:** <commands>
**Passed / Failed:** <real output summary>
**Env vars needed:** …
**Integrations working (verified):** …
**Integrations needing credentials / approval:** …
**Known issues:** …
**Next phase covers:** …
```
No section may be omitted. "None" is acceptable only when true.

---

## 7. Command Reference (established in Phase 1)

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (**must pass**) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest unit/integration |
| `npm run test:e2e` | Playwright |
| `npm run test:a11y` | axe checks |
| `npm run db:migrate` / `db:seed` | Migrations / **non-production** seed |
| `npm run check:secrets` | Secret scan |

---

## 8. Stop-and-Ask Triggers

Stop and ask the owner (via `MEMORY.md` → "Open Questions", and in your response) when:
- A price, policy, legal/tax text, or brand decision is needed.
- Paytm / Resend / Supabase credentials or approval are needed to *verify* work.
- The PRD is ambiguous in a way that changes data model or money flow.
- A change would alter an accepted ADR.
- A requested action appears in PRD §26 (out of scope).

Do **not** stop for things you can safely isolate behind an interface and document.
