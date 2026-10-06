# PLAN.md — Phased Implementation Plan

> Source of truth: [`PRD.md`](./PRD.md). Every item below cites a PRD section (`§`).
> If this plan and the PRD disagree, **the PRD wins** — then log the discrepancy in `DECISIONS.md`.

---

## 0. Repository & Asset Audit (Phase 0 findings)

| Check | Result | Consequence |
|---|---|---|
| Existing repository / `package.json` / `.git` | **None found** | PRD §28.1: "If no repository exists, initialize the project with the specified architecture." Greenfield build. |
| Existing code to preserve | None | Nothing to overwrite. Phase 1 creates the repo. |
| Jewellery photographs (PRD §2.4, §4.5) | **Not supplied.** Only a photo of a handwritten notebook page was received. | **Blocker for Phase 2 and Phase 3 seed data.** Owner must supply the 4 photographs. Never substitute stock images (PRD §4.5). |
| Brand name / logo | Not supplied | Use a single `BRAND` config object with a clearly-marked dev placeholder. |
| Prices, stock, SKUs | Not supplied | Dev placeholders only; production checkout blocks products without valid prices (PRD §2.4). |
| Paytm / Resend / Supabase / Vercel credentials | Not supplied | Build isolated integration layers; document missing config (PRD §28.3). |

### The 4 initial product concepts (PRD §2.4) — to be matched to photos once supplied
1. Pink shell charm bracelet — brown-and-cream shell beads + pink transparent beads
2. Pink shell bracelet + matching earrings set — white shells, pink beads, gold-toned hooks
3. Purple floral bracelet + earrings set — pearl-like accents
4. Ocean-inspired shell and charm chain bracelet

---

## 1. Production Functionality vs Development-Only Simulation

PRD §28.3 / §28.2: *"Make it impossible for development-only payment success to be mistaken for real payment success."*

| Capability | Production behaviour | Development / test behaviour | Guard |
|---|---|---|---|
| Payment initiation | Real Paytm API call, server-side | **Dev simulator** page (`/dev/payment-simulator`) | Compile-time + runtime guard: simulator code is **excluded** when `APP_ENV=production`; build **fails** if `PAYMENT_PROVIDER=simulator` in production |
| Payment verification | Checksum/signature verify + server-to-server status check with Paytm | Simulator signs payloads with a **different, dev-only key**; payments are stamped `provider='simulator'` | Verification code rejects `provider='simulator'` records when `APP_ENV=production` |
| Email | Resend with verified domain | Console/file-sink transport, or Resend test mode | `EMAIL_TRANSPORT` env; startup assertion in production |
| Database | Supabase production project + RLS | Local Supabase (Docker) or dev project; seed script | Seed script refuses to run if `APP_ENV=production` |
| Storage (uploads) | Private Supabase bucket, signed URLs | Local Supabase storage, private bucket | Bucket policy tests run in CI |
| Prices shown | Owner-approved only | Placeholder with visible "DEV PRICE" badge | `canPurchase()` returns false in production if price is flagged placeholder |
| Reviews / scarcity / sales claims | **Never** | **Never** | Lint rule + review checklist (PRD §2.4, §26) |

---

## 2. Missing Business Decisions & Credentials (do NOT invent)

Full tracker lives in `DECISIONS.md` §Owner Decisions. Summary of blockers by phase:

| Needed by | Item | Source |
|---|---|---|
| Phase 1 | Brand name (placeholder OK) | PRD §27 |
| Phase 1 | GitHub repo + Vercel project (for deployment pipeline) | PRD §17.1 |
| **Phase 2** | **4 jewellery photographs** (originals, highest resolution) | PRD §2.4 |
| Phase 2 | Logo / typography preference (fonts below are proposals) | PRD §27 |
| Phase 3 | Supabase project (dev + prod) | PRD §17.1 |
| Phase 3 | Product names, descriptions, prices, SKUs, stock/made-to-order rules, variants | PRD §27 |
| Phase 3 | Category structure sign-off — esp. **"Bestie Cards" vs "Bestfriend Cards"** (PRD §2.2 H leaves this open) | PRD §2.2 |
| Phase 4 | Personalization fields per product; allowed upload types/size; **photo retention period** | PRD §9, §19.4 |
| Phase 4/5 | Shipping rules: serviceable regions, charges, free-shipping threshold (if any) | PRD §15.5 |
| **Phase 5** | **Paytm merchant account approved + UPI enabled; staging & production MID/keys; callback URL whitelisting** | PRD §12 |
| Phase 5 | Whether partial refunds are supported | PRD §12.5 |
| Phase 6 | Resend account + **verified sender domain**; owner notification email | PRD §14 |
| Phase 6 | Admin account email(s) | PRD §15.1 |
| Phase 7 | Final domain; GST/tax & invoicing status (GSTIN **not** to be invented); returns/refund/privacy/terms text | PRD §14.3, §27 |

> **Paytm onboarding is the longest lead-time item.** Recommend the owner starts merchant onboarding **now**, in parallel with Phases 1–4, because Phase 5 cannot be tested against the real gateway without it.

---

## 3. Phase Overview

| Phase | Name | PRD §24 | Gate to enter |
|---|---|---|---|
| 0 | Planning & docs (this deliverable) | §28.1 | — |
| 1 | Foundation | Phase 1 | Docs approved |
| 2 | Visual Experience | Phase 2 | Phase 1 accepted + **photos supplied** |
| 3 | Catalogue & Product Pages | Phase 3 | Phase 2 accepted + Supabase dev project |
| 4 | Cart & Personalization | Phase 4 | Phase 3 accepted |
| 5 | Checkout & Payment | Phase 5 | Phase 4 accepted + Paytm staging credentials |
| 6 | Email & Admin Operations | Phase 6 | Phase 5 accepted + Resend credentials |
| 7 | Hardening & Launch | Phase 7 | Phase 6 accepted + policies + live credentials |

**Rule:** a phase is not "done" until its acceptance criteria are demonstrated with evidence (test output, build output) — not because UI exists (PRD §28.5).

---

## Phase 1 — Foundation

**Goal:** a deployable, tested, accessible shell. No commerce logic yet.

### Deliverables (PRD §24 Phase 1, §17.2, §28.4)
1. `create-next-app` — Next.js (App Router), TypeScript `strict: true` (+ `noUncheckedIndexedAccess`), ESLint, Prettier.
2. Tailwind CSS with **design tokens** from `DESIGN.md` as CSS variables + Tailwind theme.
3. Fonts via `next/font` (self-hosted, no layout shift).
4. Folder structure per `ARCHITECTURE.md` §3 (feature modules, `lib/`, `server/`, `components/ui`).
5. **Brand config** (`config/brand.ts`): name, tagline, contact placeholders, nav, announcement — all typed, all swappable.
6. Reusable accessible primitives: `Button`, `Link`, `Input`, `Label`, `FormField`, `Select`, `Checkbox`, `Dialog`, `Drawer`, `Badge`, `Price`, `Container`, `Section`, `Heading`, `VisuallyHidden`, `SkipLink`, `Toast/LiveRegion`. (Radix primitives or equivalent.)
7. Global layout: `AnnouncementBar` (config-driven), `Header` (desktop nav + mobile drawer, cart count slot), `Footer`, skip link, `<main>` landmark.
8. **All PRD §5 routes exist** as honest stubs (title + "coming in Phase N" for *non-linked* internal state) — but **no dead links in navigation**: nav only links to routes that exist and render.
9. `/admin` stub **protected by middleware returning 404/redirect** (real auth in Phase 6; stub must default to *deny*).
10. Environment config: `env.ts` using Zod — parse + fail fast; server vars cannot be imported client-side; `.env.example` (no secrets).
11. Security headers in `next.config` (CSP baseline, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors).
12. `robots.txt` (disallow `/admin`, `/order-status`, `/payment`, `/account`, `/api`), `sitemap.ts` skeleton.
13. Testing harness: **Vitest** (+ Testing Library), **Playwright**, **axe** accessibility smoke test, `money` utility tests.
14. `lib/money.ts`: integer paise only; `formatINR()`; tests (PRD §18.3 — no floats).
15. CI: GitHub Actions — typecheck, lint, unit tests, build, Playwright smoke, `gitleaks`/secret scan, `npm audit` (report).
16. Vercel config + deployment doc; preview deploy per PR.
17. Docs: `README.md`, `docs/ARCHITECTURE.md` (sync), `docs/SECURITY.md` (skeleton), `docs/DEPLOYMENT.md`, `docs/TESTING.md`, `docs/OWNER_DECISIONS.md`.

### Acceptance criteria (PRD §24 Phase 1)
- [ ] `npm run build` succeeds (show output)
- [ ] `npm run typecheck`, `lint`, `test` pass
- [ ] Layout verified at 360, 390, 768, 1024, 1440 px with **no horizontal overflow**
- [ ] Axe smoke: 0 serious/critical violations on `/`, `/shop`, `/contact`
- [ ] Keyboard: skip link, header nav, mobile drawer (focus trap + Esc) all work
- [ ] Design system consistent — all colours/spacing come from tokens (grep check for stray hex)
- [ ] `git grep` / gitleaks finds **no secrets**; `.env*` ignored except `.env.example`
- [ ] Every nav/footer link resolves to a rendering route

### Explicitly NOT in Phase 1
Database, products, cart, 3D, payments, email. No fake product data.

---

## Phase 2 — Visual Experience

**Blocked until photos are supplied.** (Design work with placeholder blocks is allowed; final acceptance is not.)

### Deliverables (PRD §6, §16, §24 Phase 2)
- Homepage sections in PRD §6 order: announcement → nav → hero → trust highlights → featured collections → featured products → personalized gifts → brand story → footer.
- Hero: editorial layout + **R3F gift-box scene** (lazy, client-only, behind `Suspense`), static image fallback.
- Scroll-reveal + hover animation via Framer Motion; CSS for trivial effects. **No GSAP** unless a documented need arises.
- `useReducedMotion` + `prefers-reduced-motion` honoured everywhere.
- `useWebGLSupport` + low-power/mobile detection → static fallback; below-fold canvases mount only when in view; unmount when out of view.
- Image pipeline: supplied photos processed to AVIF/WebP responsive sizes with `next/image`; originals preserved, aspect ratio preserved.
- Trust highlights: only factually supportable copy (PRD §6.4) — owner-approved.
- Featured products on homepage use **seed data in the same shape as the DB** so Phase 3 swap is trivial. (Dev-flagged prices.)

### Acceptance (PRD §24 Phase 2, §16.7)
- [ ] Visual direction matches PRD §4 (reviewed against `DESIGN.md` checklist)
- [ ] Supplied photos used, uncropped in key details
- [ ] Hero CTA is a real `<a>` navigating to `/shop`; works before/without animation completing
- [ ] Buttons clickable during transitions; nothing permanently hidden if animation fails
- [ ] Reduced-motion: no parallax, no continuous movement; all content visible
- [ ] WebGL disabled → static fallback, site fully usable
- [ ] CLS ≤ 0.1 measured locally via Lighthouse; LCP target ≤ 2.5s noted (lab ≠ field)
- [ ] 3D bundle is code-split: not in initial JS of non-home routes
- [ ] Every visible link/button has a real action

---

## Phase 3 — Catalogue & Product Pages

### Deliverables (PRD §2, §7, §8, §18, §24 Phase 3)
- Supabase migrations: `categories`, `products`, `product_variants`, `product_images`, (+ `site_settings`, `profiles/admin_users` skeleton). Constraints: `price_minor >= 0`, `stock_quantity >= 0`, slug unique, enums for status/fulfilment_type.
- **RLS enabled on every table**; public read policy only for `status='active'` rows; no anon writes.
- Seed script (non-production only) for the 4 concept products + categories A–J.
- Data-access layer in `server/catalogue/` (typed, Zod-validated output).
- Routes: `/shop`, `/collections/[slug]`, `/products/[slug]`, `/search` with filters (price, availability), sorting (price, newest, featured), pagination, URL-synced state.
- Postgres full-text (or `pg_trgm`) search over name, description, SKU, category (PRD §7.2).
- Product detail: gallery (thumbs, zoom, keyboard, swipe), variant selector updating price/SKU/availability, specs, shipping/returns blocks (from settings; owner-approved text), related products.
- Per-product SEO: metadata, canonical, OG, JSON-LD `Product` (only truthful fields — no fake ratings).
- Archived/draft/unknown slugs → safe `404`/"unavailable" handling.
- **Admin product management** (requires admin auth foundation pulled forward minimally): CRUD, image upload + reorder, variants, stock, fulfilment type, publish/archive. Server-side validation + audit log entries.

> **Sequencing note:** PRD places admin product management in Phase 3 but admin *auth* in Phase 6. Resolution (ADR-007): build **admin auth + RBAC foundation in Phase 3**; Phase 6 adds orders/email/audit-viewing UI on top.

### Acceptance (PRD §24 Phase 3)
- [ ] All product data from DB (no hardcoded catalogue in components)
- [ ] Product pages use correct assets
- [ ] Price/availability consistent across listing, detail, search
- [ ] Invalid product / variant / slug handled safely (tests)
- [ ] RLS tested as **anon**, **customer**, **admin** identities
- [ ] Tracked product at 0 stock cannot be added

---

## Phase 4 — Cart & Personalization

### Deliverables (PRD §9, §10, §22.1, §24 Phase 4)
- Cart store (client persistence, versioned schema, corruption-safe rehydrate). Each line has a unique `lineId`; **identical product with different customization = separate lines** (PRD §9.4).
- Cart stores only `{productId, variantId, quantity, customization, uploadIds}` — **never prices as authoritative**.
- `POST /api/cart/validate` — server re-prices, re-checks stock, validates customization; returns the authoritative cart + change notices (price/stock changed).
- Cart UI: drawer + `/cart`; qty, remove, edit customization, subtotal/shipping/total, live-region announcements.
- **Personalization engine:** product-level field schema (JSON) → Zod schema generated server-side; field types per PRD §9.1; required vs optional.
- `/personalize/[product-slug]` flow: choose template → enter fields → upload → review → add to cart → edit later.
- **Secure uploads:** signed upload to private bucket under randomized key; server-side sniffing of magic bytes (not filename/MIME), size caps, image re-encode (strips EXIF/GPS), `uploaded_assets` row `status=pending→attached`; cleanup job for orphaned uploads; access only via short-lived signed URLs for authorized staff.
- Rate limiting on upload endpoints.

### Acceptance (PRD §24 Phase 4)
- [ ] Add / update qty / remove / persist across reload
- [ ] Same product with 2 different names → 2 independent lines; editing one doesn't touch the other
- [ ] Manipulated price/total in request is ignored (test)
- [ ] Missing required variant → no add, clear message (no false "added")
- [ ] Wrong file type (e.g. `.exe` renamed `.jpg`) rejected
- [ ] Oversized file rejected
- [ ] Uploaded file URL not accessible anonymously (test)
- [ ] Server recalculates totals

---

## Phase 5 — Checkout & Payment

### Deliverables (PRD §11, §12, §13, §22.2, §24 Phase 5)
- Migrations: `orders`, `order_items`, `payments`, `payment_events`, `order_access_tokens` (hashed).
- Checkout form (client + server Zod validation): name, email, phone (IN), address, PIN (6-digit), state, country default IN.
- `createOrder` (single DB transaction): validate → re-price → stock check → **reserve/decrement policy per ADR-005** → create pending order + payment attempt → initiate provider.
- **Payment provider interface** (`PaymentProvider`): `initiate`, `verifyCallback`, `fetchStatus`, `refund`. Implementations: `PaytmProvider` (real), `SimulatorProvider` (dev-only).
- Paytm integration built **strictly from current official Paytm docs** at implementation time (endpoints, checksum, status API, callback fields). If docs/credentials unavailable → implement interface + stubs + tests with documented fixtures and mark **"NOT VERIFIED AGAINST LIVE PAYTM"**.
- Callback/webhook handler: verify signature → look up payment → **server-to-server status check** → compare order ref, provider txn ref, MID, **exact amount**, currency → transition via state machine in a DB transaction with row lock.
- **Payment state machine** (`created|pending|success|failed|cancelled|expired|refunded|partially_refunded`) — pure function, exhaustively unit-tested; `success` is terminal against late `failed`.
- Idempotency: unique provider refs, `payment_events` dedupe, `SELECT … FOR UPDATE`, stock deducted exactly once.
- `/payment/return`: **display only** — resolves status from server; never trusts query params; shows *verifying* for pending.
- `/order-status/[reference]`: requires high-entropy access token (or auth session); `noindex`; expiry.
- Reconciliation: job that rechecks `pending` payments older than N minutes; expiry of stale pending orders & stock release.
- Retry-safe: new payment attempt for same order allowed only if no `success`/`pending-verified` attempt exists.
- Rate limiting on checkout/callback endpoints; audit trail.

### Acceptance (PRD §24 Phase 5)
- [ ] Only verified-success transitions order to paid
- [ ] Amount mismatch rejected (test)
- [ ] Duplicate callbacks safe: one paid transition, one stock deduction (test)
- [ ] Late `failed` after `success` ignored (test)
- [ ] Pending shows "verifying", never "failed"
- [ ] Failed payment → no confirmation email event, no paid state
- [ ] Simulator unreachable and un-bundled in production build (test)
- [ ] **Paytm marked "verified" only after a successful run against Paytm's staging with real credentials**

---

## Phase 6 — Email & Admin Operations

### Deliverables (PRD §14, §15, §24 Phase 6)
- `email_outbox` with unique `event_key` (`owner_order_paid:{order_id}`, `buyer_receipt:{order_id}`); rows inserted **in the same transaction** as the paid transition.
- Outbox worker (cron-triggered + opportunistic dispatch): claim rows with `FOR UPDATE SKIP LOCKED`, send via Resend, exponential backoff, `attempt_count`, `last_error_code`, dead-letter state.
- React Email templates: owner notification, buyer confirmation/receipt (clearly **not** a GST invoice unless owner configures tax settings).
- Owner email includes **time-limited signed links** to uploaded files (not public URLs).
- Admin: dashboard metrics (from DB), orders list/search/filters, order detail, fulfilment state machine, internal notes, email status + **retry button**, stock management, low-stock, audit log viewer, settings (brand, announcement, shipping, policies, owner email).
- Admin **cannot** set payment status by dropdown. Exceptional manual reconciliation = separate, permission-gated action that re-queries provider and writes audit entry.
- Refunds: initiate via provider API; state only changes on verified provider outcome.
- `admin_audit_logs` written for every mutation.

### Acceptance (PRD §24 Phase 6)
- [ ] Paid order → exactly 2 outbox rows
- [ ] Replayed callback → still exactly 2 rows, 0 additional sends
- [ ] Email provider down → payment remains `success`; email retried
- [ ] Non-admin gets 403/404 on every admin route + server action
- [ ] Audit log row exists for each admin write (test)

---

## Phase 7 — Hardening & Launch

### Deliverables (PRD §23, §24 Phase 7, §25)
- Security review against PRD §19 & OWASP ASVS L1/L2 checklist; dependency audit; CSP tightening; rate-limit review; RLS re-test.
- Accessibility audit (axe + manual keyboard + screen-reader pass) → WCAG 2.2 AA fixes.
- Performance: Lighthouse CI budgets; image audit; 3D bundle audit; real-device low-end Android test.
- SEO: sitemap, robots, canonical, JSON-LD validation.
- Monitoring: error tracking (e.g. Sentry — owner decision), uptime check, payment-failure alerts, outbox-failure alerts.
- Policy pages populated with **owner-approved** text (shipping, returns/refunds, privacy, terms, contact).
- Backup & recovery runbook (Supabase PITR / scheduled dumps, restore drill).
- Production payment test with **live merchant config** (minimal-value real transaction by owner, then refunded — owner's decision).
- Launch checklist (PRD §23.6, §25) signed off; owner training/handover doc.

### Acceptance (PRD §24 Phase 7, §25)
All boxes in PRD §25 ticked **with evidence**, plus an explicit **"Not configured / Incomplete"** disclosure list (PRD §28.6 #17).

---

## 4. Test Matrix (PRD §23)

| Layer | Tooling | Introduced | Must cover |
|---|---|---|---|
| Unit | Vitest | P1 | money, pricing, shipping, variant/qty/customization validation, state machines, idempotency keys, outbox key generation |
| Integration | Vitest + local Supabase | P3 | catalogue queries, cart validation, order creation, stock, signature check, status verify, outbox, storage policies |
| RLS / authz | SQL tests / Vitest as 3 identities | P3 | anon / customer / admin |
| E2E | Playwright | P1 smoke → P7 full | PRD §23.3 journeys 1–16 |
| A11y | axe-playwright + manual | P1 | every route |
| Security | custom tests + ZAP baseline (optional) | P5–P7 | price tamper, IDOR, upload abuse, admin bypass, callback forgery |
| Visual / device | Playwright projects + real devices | P2–P7 | 360/390/768/1024/1440, reduced motion, no-WebGL |
| Payment | Paytm staging | P5 | success, failed, cancelled, pending, repeated, delayed |

---

## 5. Risk Register

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | Paytm onboarding/approval delay | High | Start now; build provider interface + simulator so Phases 1–4 and most of 5 proceed |
| R2 | Photos not supplied | Medium | Phase 2 blocked from acceptance; use neutral labelled placeholders, never stock photos |
| R3 | 3D hurts mobile performance | Medium | Static fallback default on mobile/low-power; lazy canvas; budgets in CI |
| R4 | Serverless limits (upload size, cron frequency, timeouts) | Medium | Signed direct-to-storage uploads; verify current Vercel plan limits before choosing cron strategy (ADR-009) |
| R5 | Stock oversell / double deduction | Medium | Transactional decrement + row locks + idempotent state machine + tests |
| R6 | Paytm API details differ from memory | Medium | Read current official docs at Phase 5 start; never invent endpoints; record doc version/date in `DECISIONS.md` |
| R7 | Legal/tax unknowns (GST, DPDP, consumer rules) | Medium | Owner/legal sign-off; templates clearly marked draft until approved |
| R8 | PRD palette fails AA contrast | Certain (computed) | Use accessible variants defined in `DESIGN.md` |
| R9 | Scope creep into PRD §26 items | Medium | `RULES.md` forbids; changes require ADR |

---

## 6. Definition of Done (every phase)

1. Acceptance criteria demonstrated with command output.
2. Typecheck, lint, tests, **production build** green.
3. No secrets in repo; `.env.example` updated.
4. Docs updated (`README`, `ARCHITECTURE.md`, `DECISIONS.md`, `MEMORY.md`).
5. **Phase report** posted in the PRD §28.5 format.
6. App remains deployable.
