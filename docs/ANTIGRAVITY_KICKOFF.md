# ANTIGRAVITY_KICKOFF.md — How to Build This with Antigravity

Copy-paste prompts for running the build phase by phase. Written to be tool-agnostic, so they also work in Claude Code, Cursor, or any agentic IDE.

> **Caveat:** I can't confirm Antigravity's exact UI labels or its rules/workflow folder conventions for your installed version. Where I mention them below, check your version's docs. The prompts themselves don't depend on any Antigravity-specific feature.

---

## 1. One-Time Setup

1. **Create an empty folder** (e.g. `shell-gifts-store`) and `git init`.
2. **Copy the docs in** → `/docs/` (all 9 `.md` files from this package).
3. **Surface the rules:** copy `docs/AGENTS.md` to the repo root as `AGENTS.md`. If your Antigravity version supports workspace rules (a rules folder or settings panel), paste/point `docs/RULES.md` there too, so it's always in context. (If unsure, the kickoff prompt below tells the agent to read every file anyway.)
4. **Put the 4 jewellery photos** in `/assets-source/jewellery/` (originals, untouched). **Do this before Phase 2.**
5. **Create accounts early** (they have lead time): Paytm merchant onboarding · Supabase · Vercel · GitHub · Resend. Do **not** paste secrets into chat; the agent will create `.env.example` and you'll fill `.env.local` yourself.
6. **Open the folder as the workspace** in Antigravity and start with Prompt 0.

### Model/agent advice
- Run **one phase per conversation/task**. Don't ask for "the whole site" in one go (PRD §24).
- For Phases 5–6 (money, auth, security) use your strongest reasoning model and **review the diff yourself** before merging.
- Ask the agent to open a branch per phase: `phase-1-foundation`, `phase-2-visual`, …

---

## 2. Prompt 0 — Orientation & Plan Confirmation (no code)

```
You are the lead full-stack engineer on this project.

Read, in this order, completely: docs/AGENTS.md, docs/RULES.md, docs/MEMORY.md,
docs/DECISIONS.md, docs/PLAN.md, docs/ARCHITECTURE.md, docs/DESIGN.md, docs/PRD.md.
docs/PRD.md is the source of truth.

Before modifying any files:
1. Inspect the repository (git status, file tree, package.json if present). Report the
   current stack and existing functionality honestly — if it is empty, say so.
2. Check /assets-source for jewellery photographs. List what you find, or state that none exist.
3. Compare the current state against PLAN.md and tell me anything in PLAN.md that is
   wrong, outdated, or missing relative to the PRD.
4. List missing business decisions and credentials (DECISIONS.md Part 2/3) that would
   block Phase 1. Do not invent any values.
5. Distinguish production functionality from development-only simulation.

Do NOT write application code yet. Reply with: findings, a corrected Phase 1 task list,
and questions. Then wait for my approval.
```

---

## 3. Prompt 1 — Phase 1: Foundation

```
Begin Phase 1 ONLY (docs/PLAN.md → "Phase 1 — Foundation"). Do not start Phase 2.

Create a branch `phase-1-foundation`. Follow docs/RULES.md and docs/ARCHITECTURE.md §1, §3, §12.

Deliver exactly the Phase 1 list in PLAN.md: Next.js (App Router) + strict TypeScript,
Tailwind with the tokens from DESIGN.md §1 (use the accessible variants), next/font,
folder structure per ARCHITECTURE §3, config/brand.ts, Zod env validation + .env.example
(names only), accessible UI primitives (DESIGN §4), Announcement bar + Header (mobile
drawer) + Footer, stub pages for every PRD §5 route (no dead links in nav), middleware that
denies /admin by default, security headers, robots + sitemap skeleton, lib/money.ts (integer
paise) with tests, Vitest + Playwright + axe harness, GitHub Actions CI incl. secret scan,
and docs (README, SECURITY skeleton, DEPLOYMENT, TESTING, OWNER_DECISIONS).

Rules for this phase:
- No database, products, cart, 3D, payments, or email. No fake product data.
- Preserve anything that already works; explain before changing existing files.
- Add tests for money utilities and env validation; add an a11y smoke test and a
  responsive/no-overflow test at 360/390/768/1024/1440.
- Verify contrast for --border and --ring tokens and record the numbers.

When finished, run and show REAL output of: typecheck, lint, test, build, test:e2e.
Then post the Phase Report in the exact format of AGENTS.md §6, update MEMORY.md and
DECISIONS.md, and STOP. Do not claim anything works that you did not run.
```

---

## 4. Prompt 2 — Phase 2: Visual Experience

```
Begin Phase 2 ONLY. Prerequisite: Phase 1 accepted; jewellery photographs present in
/assets-source/jewellery (if absent, STOP and ask me).

Implement PLAN.md "Phase 2" using DESIGN.md §5–§8: homepage sections in PRD §6 order,
editorial hero + lazy R3F gift-box scene with static fallback, scroll/hover animation
(Framer Motion + CSS only), reduced-motion support, WebGL/low-power fallbacks, responsive
image pipeline (AVIF/WebP, original files preserved, no cropping of key details).

Constraints:
- Use ONLY my supplied photos for products. No stock images. Describe each photo's
  contents in alt text only as far as you can actually see, and list them for my confirmation.
- Hero CTA is a real link to /shop and works before/without animation.
- Trust highlights and brand story use clearly-marked placeholder copy until I approve it.
- Featured products use seed data shaped like the future DB rows, with dev-price badges.
- No GSAP. 3D chunk must be code-split and absent from non-home routes.

Prove: reduced-motion works, WebGL-off works, no CLS, buttons clickable during transitions,
every visible control has a real action. Report Lighthouse numbers as lab measurements, not guarantees.
Finish with the Phase Report; update MEMORY.md/DECISIONS.md; STOP.
```

---

## 5. Prompt 3 — Phase 3: Catalogue & Product Pages

```
Begin Phase 3 ONLY. Prerequisite: Supabase dev project + local env configured by me.

Implement PLAN.md "Phase 3" and ADR-007 (admin auth foundation now). Use SQL migrations
with RLS in the same files (ARCHITECTURE §4). Seed script must refuse to run in production.
Build data-access in src/server/catalogue, routes /shop, /collections/[slug], /products/[slug],
/search, filters/sort/pagination, gallery, variant selector, JSON-LD only with truthful fields,
and admin product management with server-side validation + audit log.

Tests required: RLS matrix as anon / customer / admin; invalid slug/variant handling;
tracked product at 0 stock cannot be added; price/availability consistent across pages.
Never hardcode catalogue data in components. Placeholder prices must be flagged so
production checkout can refuse them.

Phase Report, update MEMORY/DECISIONS, STOP.
```

---

## 6. Prompt 4 — Phase 4: Cart & Personalization

```
Begin Phase 4 ONLY. Implement PLAN.md "Phase 4", ADR-003 and ADR-008.

Cart stores intent only; /api/cart/validate returns authoritative pricing. Same product
with different customization = separate lines. Personalization schema per product compiled
to Zod server-side. Uploads: signed direct-to-private-storage, random keys, magic-byte
sniffing, size caps, sharp re-encode (strip EXIF), orphan cleanup, rate limiting.

Tests: tampered price/total ignored; missing required variant doesn't add; renamed .exe
rejected; oversize rejected; uploaded file not anonymously accessible; two customized lines
stay independent; corrupted localStorage recovers gracefully.
Phase Report, update MEMORY/DECISIONS, STOP.
```

---

## 7. Prompt 5 — Phase 5: Checkout & Payment (highest risk)

```
Begin Phase 5 ONLY. Before writing the Paytm adapter:
1. Fetch and read the CURRENT official Paytm merchant integration documentation
   (initiate transaction, checksum/signature, callback/webhook, transaction status,
   refunds, UPI flows). Do NOT rely on memory or blog examples.
2. Record in DECISIONS.md ADR-015: URLs, date consulted, API/SDK versions, and anything
   that differs from ARCHITECTURE §6. If docs are inaccessible, say so and stop that part.

Then implement PLAN.md "Phase 5" per ARCHITECTURE §5–§6: createOrder transaction,
PaymentProvider interface, PaytmProvider, dev-only SimulatorProvider (excluded from
production builds, rejected at runtime), pure payment state machine, callback handler
(verify signature → server-to-server status → compare order ref, txn ref, MID, exact
amount, currency → locked transition), idempotency, /payment/return (display only),
/order-status/[reference] with hashed expiring access token, reconciliation job.

Tests required (real, passing): amount mismatch rejected; forged/invalid signature
rejected; duplicate callback → one paid transition, one stock change; late 'failed' after
'success' ignored; pending shows 'verifying'; failed payment → no email events;
simulator absent from production build; concurrent callbacks safe.

Label Paytm "NOT VERIFIED AGAINST LIVE SERVICE" unless you ran it against Paytm staging
with real credentials that I provided. Never mark an order paid without verification.
Phase Report, update MEMORY/DECISIONS, STOP.
```

---

## 8. Prompt 6 — Phase 6: Email & Admin Operations

```
Begin Phase 6 ONLY. Implement PLAN.md "Phase 6" per ARCHITECTURE §8–§9.

Outbox rows (owner_order_paid:{id}, buyer_receipt:{id}, unique event_key) inserted in the
SAME transaction as the paid transition. Worker with SKIP LOCKED, backoff, dead-letter,
admin retry button. React Email templates (receipt is NOT a GST invoice; no invented tax
data). Owner email links to authenticated, audited, short-lived file access — never public URLs.
Admin: metrics from DB, orders list/search/filters, fulfilment state machine, notes, email
status/retry, stock, audit log viewer, settings. Payment status is read-only; refunds and
manual reconciliation are separate permissioned actions that call the provider and are audited.

Tests: paid order → exactly 2 outbox rows; replayed callback → still 2 and 0 extra sends;
email provider down → payment stays success and email retries; non-admin denied on every
admin route AND server action; audit row for every admin write.
Phase Report, update MEMORY/DECISIONS, STOP.
```

---

## 9. Prompt 7 — Phase 7: Hardening & Launch

```
Begin Phase 7 ONLY. Implement PLAN.md "Phase 7".

Run and report: security review vs RULES.md and PRD §19 (price tamper, IDOR, upload abuse,
admin bypass, callback forgery/replay), dependency audit, CSP tightening, axe + manual
keyboard pass for WCAG 2.2 AA, Lighthouse CI budgets from measured baselines, SEO
(sitemap, robots, canonical, JSON-LD), monitoring + alerts, policy pages using ONLY
owner-approved text, backup/restore runbook, production readiness checklist (PRD §23.6, §25).

Produce a final "Not configured / Incomplete" disclosure list (PRD §28.6 #17).
Do not tick any PRD §25 box without evidence. Phase Report, update MEMORY/DECISIONS, STOP.
```

---

## 10. Recurring Prompts

**Resume a session**
```
Read docs/AGENTS.md, RULES.md, MEMORY.md, DECISIONS.md. Summarise current phase, last
session's outcome, blockers, and propose the next smallest task. Wait for my go-ahead.
```

**Verification pass (use after every phase)**
```
Audit your own phase against its acceptance criteria in docs/PLAN.md. For each criterion
give: PASS/FAIL, the exact command or test that proves it, and its real output. List anything
you claimed earlier that you did not actually run. Do not fix anything yet — report first.
```

**Security spot-check**
```
Act as an adversarial reviewer of the latest changes against docs/RULES.md sections A–E.
Try to find: client-trusted prices, missing authz, missing RLS, secrets in client bundle,
non-idempotent handlers, PII in logs/URLs. Report findings with file paths and fixes.
```

**Scope guard**
```
Check the diff for anything listed in PRD §26 (out of scope) or any dependency not
justified in DECISIONS.md. List and propose removal.
```

---

## 11. What Each Phase Needs From You

| Before… | You provide |
|---|---|
| Phase 1 | GitHub repo, Vercel project, (brand placeholder OK) |
| Phase 2 | **4 jewellery photos**, logo/fonts preference, approved trust/brand copy, contact details |
| Phase 3 | Supabase project, product names/descriptions/prices/SKUs/stock/variants, category decisions, admin email |
| Phase 4 | Personalization fields/templates, upload rules, photo retention period, shipping rules |
| Phase 5 | **Paytm merchant account + staging credentials**, stock policy, refund policy |
| Phase 6 | Resend account + verified domain, owner notification email |
| Phase 7 | Domain, tax/GST status, approved policy text, monitoring vendor choice |
