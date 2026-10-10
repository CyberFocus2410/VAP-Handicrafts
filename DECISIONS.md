# DECISIONS.md — Decision Log (ADRs) & Owner Decisions

Two parts:
1. **Architecture Decision Records** — technical choices. Status: `Accepted` (follows PRD) · `Proposed` (my recommendation, awaiting sign-off) · `Superseded`.
2. **Owner Decisions** — business inputs the PRD requires (§27). **Never invent these.** Status: `OPEN` until the owner supplies them.

Rule: an `Accepted` ADR is not changed without a new ADR that supersedes it.

---

# Part 1 — Architecture Decision Records

### ADR-001 — Greenfield build on the PRD stack
- **Status:** Accepted
- **Context:** Repo audit (2026-10-10) found no existing repository, code, or product assets. PRD §28.1 says to initialize with the specified architecture if none exists.
- **Decision:** Next.js App Router + TypeScript strict + Tailwind + Supabase + Paytm + Resend + Vercel, as PRD §17.1.
- **Consequences:** No legacy code to preserve. Library versions pinned at Phase 1 from current stable releases.

### ADR-002 — Money as integer paise
- **Status:** Accepted (PRD §18.3)
- **Decision:** All amounts stored/computed as integer minor units (`*_minor`). Single conversion point at the Paytm adapter boundary.
- **Consequences:** `lib/money.ts` + tests are the first code written in Phase 1.

### ADR-003 — Cart is client-persisted; server is authoritative
- **Status:** Proposed
- **Context:** PRD §10.2 allows client storage or anonymous cart ID. Guest checkout must work; server must never trust client prices.
- **Decision:** Zustand + localStorage cart holding *intent only* (product, variant, qty, customization, upload IDs). `POST /api/cart/validate` returns the authoritative priced cart. No `carts` table at launch.
- **Alternatives:** DB-persisted anonymous carts (cross-device, more tables/RLS/cleanup).
- **Consequences:** Simple, fast, no cart PII server-side. Cart doesn't follow user across devices (acceptable; accounts deferred). `carts/cart_items` tables remain in the logical model and can be added later.

### ADR-004 — Serverless-safe rate limiting
- **Status:** Proposed
- **Decision:** Upstash Redis rate limiter (or Postgres-backed). In-memory limiters are not allowed (PRD §17.5).
- **Open:** Needs an Upstash account (or choose Postgres limiter to avoid another vendor). **Owner/lead to choose.**

### ADR-005 — Stock reservation policy
- **Status:** Proposed — **owner input needed** (do you sell single-quantity handmade-style items where overselling is costly?)
- **Options:** (A) reserve at order creation, release on verified failure/expiry; (B) deduct only on verified payment.
- **Recommendation:** A, with release only after provider status confirms non-success. See ARCHITECTURE §5.5.
- **Consequences:** Requires expiry + reconciliation job; must have tests for concurrent buyers of last unit.

### ADR-006 — Accessible colour variants
- **Status:** Proposed
- **Context:** Computed contrast shows PRD `dusty-rose #C9857B` with white text = **2.95:1** (fails AA 4.5:1) and cocoa-on-rose = 4.20:1; `champagne #B69A67` on background = **2.48:1**.
- **Decision:** Keep PRD colours as decorative tokens; introduce `rose-deep #A15B52` (ivory text 5.00:1), `rose-deeper #9A554D`, `gold-deep #7A6232`, `cocoa-muted #6B4F49`, `success #2F6B3F`, `error #A32B2B` for text/controls. PRD §4.2 permits refinement and §20.2 requires AA.
- **Consequences:** Primary buttons are a deeper rose than the PRD's swatch. Owner may adjust within AA.

### ADR-007 — Admin auth foundation built in Phase 3
- **Status:** Proposed
- **Context:** PRD §24 puts admin product management in Phase 3 but authentication/audit in Phase 6. Product management can't be safe without auth.
- **Decision:** Build Supabase Auth + `admin_users` allow-list + `requireAdmin()` + audit-log writer in Phase 3. Phase 6 adds orders/email/metrics UI.
- **Consequences:** Phase 3 grows slightly; no unauthenticated admin surface ever exists.

### ADR-008 — Direct-to-storage uploads with server-side validation
- **Status:** Proposed
- **Context:** Serverless request-body limits (verify current Vercel limit) make large photo uploads through functions risky.
- **Decision:** Signed upload URLs to a private bucket with random keys; post-upload server validation (magic bytes, size, `sharp` re-encode, strip EXIF); orphan cleanup.
- **Consequences:** Two-step upload API; clients cannot rely on MIME/filename.

### ADR-009 — Outbox scheduler
- **Status:** Proposed — **verify current Vercel Cron limits for the chosen plan before implementing**
- **Decision:** Opportunistic dispatch right after payment verification + a scheduled sweeper for retries/reconciliation/cleanup, secured with `CRON_SECRET`. Scheduler = Vercel Cron if the plan allows required frequency; otherwise Supabase `pg_cron`/Edge Function or external scheduler.
- **Consequences:** Retry latency depends on scheduler choice.

### ADR-010 — Late success after cancel/expiry
- **Status:** Proposed
- **Context:** A customer may pay just after we mark an order expired and release stock.
- **Decision:** Verified provider `success` can move `failed|cancelled|expired → success` **only** via signature-verified callback or reconciliation status check with exact amount/ref match; the event is audited and the order is flagged for owner review if stock was already released (possible refund).
- **Consequences:** Never silently discard real money; never mark paid without verification.

### ADR-011 — Customer accounts deferred; guest checkout first
- **Status:** Proposed (PRD §5 allows deferral)
- **Decision:** Launch with guest checkout + tokenized order-status links. `/account` routes exist but show a "not available yet" state **without linking to them in nav**.
- **Consequences:** Order history for customers arrives post-launch.

### ADR-012 — Receipt, not tax invoice
- **Status:** Accepted (PRD §14.3)
- **Decision:** Buyer email is a confirmation/receipt. No GSTIN, tax rate, or invoice numbering is generated until the owner supplies tax/registration details and a tax invoice format is approved.

### ADR-013 — Single animation stack
- **Status:** Accepted (PRD §16.1)
- **Decision:** Framer Motion + CSS; R3F for one hero scene. No GSAP unless a documented scroll-timeline requirement can't be met otherwise.

### ADR-014 — Plain-SQL migrations via Supabase CLI
- **Status:** Proposed
- **Decision:** Versioned SQL migrations (schema + RLS + constraints together), generated TS types from DB. No ORM at launch.
- **Alternatives:** Drizzle/Prisma (more typing ergonomics, adds a layer over Supabase RLS).

### ADR-015 — Paytm integration sourced from official docs at implementation time
- **Status:** Accepted (PRD §12.2)
- **Decision:** Adapter written from current official Paytm merchant documentation. At Phase 5 start, record here: docs URL, date consulted, API/SDK versions, supported UPI flows for the merchant account, callback vs webhook behaviour, refund API.
- **Docs consulted:** _none yet_
- **Consequences:** Until verified against Paytm staging with real credentials, Paytm is labelled **NOT VERIFIED AGAINST LIVE SERVICE**.

### ADR-016 — Documentation file naming
- **Status:** Accepted
- **Decision:** Context files use uppercase names (`AGENTS.md`, `RULES.md`, …) in `/docs`; `AGENTS.md` and `RULES.md` are additionally surfaced at repo root / in the agent-rules location of the tooling in use (verify the exact path convention for your Antigravity version).

---

# Part 2 — Owner Decisions & Inputs (PRD §27)

> **Do not invent any of these.** Until supplied, development uses clearly labelled placeholders.

| # | Item | Needed by | Status | Value / Notes |
|---|---|---|---|---|
| O-01 | **Final brand name** | P1 (placeholder OK) | **CONFIRMED** | **VAP Handicrafts** (Confirmed 2026-10-10) |
| O-02 | Logo & final typography preference | P2 | OPEN | Cormorant Garamond & Inter proposals active |
| O-03 | **4 jewellery photographs (originals, highest res)** | **P2** | **RECEIVED** | 4 original high-res photos supplied in `assets-source/jewellery/` |
| O-04 | Confirmation of what each photo shows (for accurate alt text/descriptions) | P2 | PENDING CONFIRMATION | Drafted grounded alt texts based strictly on visual observation |
| O-05 | Product names, short & full descriptions | P3 | OPEN | Drafted grounded sample names in `seed-products.ts` |
| O-06 | **Approved selling prices** (incl. compare-at) | P3 | OPEN | Displayed with DEV SAMPLE flags (PRD §2.4) |
| O-07 | SKUs / internal codes | P3 | OPEN | `VAP-BRAC-001...` format implemented |
| O-08 | Stock quantities or made-to-order rules per product | P3 | OPEN | Defaulted to made-to-order where appropriate |
| O-09 | Variants actually offered (design/colour/size/bundle/format) | P3 | OPEN | Standard / Petite size variants modelled |
| O-10 | Category structure: keep **Bestie Cards** and **Bestfriend Cards** separate, or merge? | P3 | OPEN | PRD §2.2 G/H leaves open |
| O-11 | Are products actually handmade / genuine shell / natural? (controls what claims we may make) | P2 | PENDING CONFIRMATION | Natural shells verified visually from photos |
| O-12 | Trust highlights approved wording | P2 | PENDING APPROVAL | Grounded 4-point highlights drafted on homepage |
| O-13 | Brand story copy | P2 | PENDING APPROVAL | Drafted and flagged with "Pending Owner Copy Approval" badge |
| O-14 | Personalization fields & templates per product (Polaroid options, magazine fields, card designs) | P4 | OPEN | PRD §9.1 |
| O-15 | Upload rules: allowed formats, max size, max photos per item | P4 | OPEN | Proposal to be tabled in P4 |
| O-16 | **Customer photo retention & deletion period** | P4 | OPEN | PRD §9.3, §19.4 |
| O-17 | Shipping: serviceable regions, charges, delivery estimates, free-shipping threshold (if any) | P4/P5 | OPEN | PRD §15.5 |
| O-18 | Production/dispatch lead times for personalized items | P3 | OPEN | PRD §8 |
| O-19 | Discounts/coupons at launch? | P5 | OPEN (default: **no**) | PRD §10.1 "if implemented" |
| O-20 | **Paytm merchant account approved; UPI enabled; staging + production credentials; callback URL whitelisting** | **P5** | **OPEN — long lead time** | Start onboarding now |
| O-21 | Partial refunds supported? | P5 | OPEN | PRD §12.5 |
| O-22 | Supabase projects (dev/staging + production) & plan | P3 | OPEN | Blocked on owner Supabase project creation |
| O-23 | GitHub repository | P1 | **CONFIRMED** | `https://github.com/CyberFocus2410/VAP-Handicrafts` |
| O-24 | Vercel project & plan (affects cron limits) | P1 | OPEN | ADR-009 |
| O-25 | Resend account + **verified sender domain** + `EMAIL_FROM` | P6 | OPEN | — |
| O-26 | Owner notification email address | P6 | OPEN | PRD §14.1 |
| O-27 | Admin account email(s); MFA required? | P3 | OPEN | — |
| O-28 | Final domain | P7 | OPEN | — |
| O-29 | Tax: GST registration status, GSTIN, rates, invoice requirements (**not to be invented**) | P6/P7 | OPEN | PRD §14.3 |
| O-30 | Policy text: shipping, returns/refunds/cancellation, privacy, terms | P7 | OPEN | Draft templates are *drafts* until approved/legal-reviewed |
| O-31 | Contact details: support email, phone, business address | P2/P7 | OPEN | PRD §6.9, §13.3 |
| O-32 | Social media links | P2 | OPEN (optional) | Footer only when available |
| O-33 | Rate-limit store (Upstash vs Postgres) | P4 | OPEN | ADR-004 |
| O-34 | Error monitoring vendor (e.g. Sentry) | P7 | OPEN | — |
| O-35 | Analytics tool (privacy-conscious), if any | post-P7 | OPEN | PRD §21.2 |

---

# Part 3 — Credentials Needed (never commit; deliver via Vercel/Supabase secret stores)

| Service | What's needed | Phase |
|---|---|---|
| Supabase | URL, anon key, service-role key (dev + prod) | P3 |
| Paytm | MID, merchant key, website/industry params, staging + prod, callback config *(exact list per official docs)* | P5 |
| Resend | API key, verified domain | P6 |
| Upstash (if chosen) | REST URL + token | P4 |
| Sentry (if chosen) | DSN | P7 |
| Cron | `CRON_SECRET` (generated by us) | P5/P6 |

---

# Part 4 — Change Log

| Date | Entry |
|---|---|
| 2026-10-10 | Phase 0 complete: PRD read in full; repo audit (no repo, no photos); ADR-001…016 drafted; contrast audit run (ADR-006). |
| 2026-10-10 | Phase 1 Foundation complete & accepted: Brand confirmed as "VAP Handicrafts" (O-01); Next.js 15, strict TS, Radix UI, paise currency core, tokens, security headers, Playwright E2E & Axe audits passed. |
| 2026-10-10 | Phase 2 Visual Experience complete & accepted: Supplied 4 jewellery photos processed into responsive WebP/JPEG pipeline; R3F 3D gift-box hero scene code-split with static poster fallback; homepage sections in PRD §6 order; 4 seed products with dev-price badges; 28 unit tests and 90 Playwright E2E tests (including mobile & WCAG 2.2 AA) passing. |
