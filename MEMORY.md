# MEMORY.md — Living Project State

> **Purpose:** the single "where are we?" file. Agents read it at the start of every session and **update it at the end** (AGENTS.md §3.3). Keep it short, factual, current. History goes in the log at the bottom.
> Never write secrets here.

---

## 1. Snapshot

| Field | Value |
|---|---|
| Project | Premium 3D ecommerce — shell jewellery, personalized gifts & keepsakes |
| Market / currency | India / INR (₹), UPI via Paytm |
| Hosting | Vercel |
| Brand name | **VAP Handicrafts** (O-01 confirmed) |
| Source of truth | `docs/PRD.md` (v1.0) |
| **Current phase** | **Phase 1 complete & verified → awaiting Phase 2 prerequisites (jewellery photos)** |
| Last updated | 2026-10-10 |
| Repo exists? | ✅ Yes (`phase-1-foundation` branch initialized) |
| Deployable build? | ✅ Yes (`npm run build` succeeds, 20 routes compiled) |

## 2. Phase Tracker

| Phase | Status | Evidence |
|---|---|---|
| 0 Planning & docs | ✅ Done | 9 docs in `/docs` |
| 1 Foundation | ✅ Done | Build passed, 22 unit tests passed, 68 Playwright/Axe E2E tests passed |
| 2 Visual Experience | ⬜ Not started — **blocked on photos (O-03)** for acceptance | Assets folder empty |
| 3 Catalogue & Product Pages | ⬜ | — |
| 4 Cart & Personalization | ⬜ | — |
| 5 Checkout & Payment | ⬜ — needs Paytm staging creds | — |
| 6 Email & Admin | ⬜ — needs Resend creds | — |
| 7 Hardening & Launch | ⬜ | — |

Legend: ⬜ not started · 🟨 in progress · ✅ accepted (criteria demonstrated) · ⛔ blocked

## 3. Integration Status (truth table — update only with evidence)

| Integration | Implemented | Tested | Verified against live/staging service | Notes |
|---|---|---|---|---|
| Next.js app / build | ✅ | ✅ | n/a | Local build & e2e green |
| Supabase (DB/Auth/Storage) | ❌ | ❌ | ❌ | Scheduled for Phase 3 |
| Paytm PG | ❌ | ❌ | ❌ | Scheduled for Phase 5 |
| Resend | ❌ | ❌ | ❌ | Scheduled for Phase 6 |
| Vercel deploy | ❌ | ❌ | ❌ | Repo ready for Vercel link |
| 3D hero | ❌ | ❌ | n/a | Scheduled for Phase 2 |

## 4. Known Facts

- Brand name confirmed as **VAP Handicrafts** (owner decision O-01).
- Token contrast mathematically verified via `contrast.test.ts`:
  - `--ring` (`#6E3F38`) on `--bg` (`#FAF5EF`): **7.97:1** (exceeds WCAG 2.2 AA target of 3.0:1)
  - `--ring` (`#6E3F38`) on `--surface` (`#FFFDF9`): **8.50:1** (exceeds WCAG 2.2 AA target of 3.0:1)
  - `--border` (cocoa 14%) on `--bg`: **1.29:1**
  - `--border` (cocoa 14%) on `--surface`: **1.29:1**
  - `--rose-deep` (`#A15B52`) with ivory text: **5.00:1** (exceeds WCAG AA target of 4.5:1)
- Integer paise money arithmetic thoroughly tested with zero float accumulation (`src/lib/money.test.ts`, 16 tests).
- E2E Responsive layout verified with zero horizontal overflow across 360, 390, 768, 1024, 1440px viewports (`tests/e2e/responsive.spec.ts`).
- Axe automated accessibility audit passed with 0 serious or critical violations on `/`, `/shop`, `/contact`, `/about` (`tests/e2e/a11y.spec.ts`).
- Middleware blocks `/admin` with 404 (deny-by-default verified in `tests/e2e/smoke.spec.ts`).
- Zero secret violations found by `npm run check:secrets`.

## 5. Blockers

| ID | Blocker | Blocks | Owner action |
|---|---|---|---|
| B1 | 4 jewellery photographs not supplied | P2 acceptance, P3 seed | Place originals in `/assets-source/jewellery/` |
| B2 | Paytm merchant onboarding | P5 verification | Start/complete onboarding; share staging creds |
| B3 | Supabase project(s) | P3 | Create dev (+prod) projects |
| B4 | GitHub repo / Vercel project | P1 remote CI/CD | Connect git remote and Vercel project |
| B5 | Resend + verified domain | P6 | Set up |
| B6 | Policies, prices, shipping, retention, tax details | P3–P7 | See DECISIONS Part 2 |

## 6. Open Questions for the Owner (top priority first)

1. Can you place the 4 original jewellery photos in `/assets-source/jewellery/`? (Prerequisite for Phase 2)
2. Is Paytm merchant onboarding already in progress? Which UPI flows are enabled?
3. Do you sell single-piece items (overselling risk → ADR-005 reservation) or can you restock/make to order?
4. Are the products handmade? (decides what we may claim on the site)
5. Keep "Bestie" and "Bestfriend" cards as separate collections?

## 7. Conventions in Force (quick reference)

- Money = integer paise. Server recomputes everything.
- Paid status only via verified Paytm status + exact amount match + state machine + DB txn.
- Emails via outbox, only after verified payment.
- Admin: server-side authz on every operation + audit log.
- Customer uploads: private bucket, random keys, server-side validation, signed URLs.
- No fabricated reviews/stock/claims. No stock photos for products.
- Simulator never in production.

## 8. Next Actions

1. Owner supplies the 4 jewellery photographs in `/assets-source/jewellery/`.
2. Begin **Phase 2 — Visual Experience** per `docs/PLAN.md`.

---

## 9. Session Log (append newest at top)

```
### 2026-10-10 — Phase 1 (Foundation) Complete
- Initialized branch `phase-1-foundation`.
- Scaffolding: Next.js 15 (App Router), React 19, strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`), Tailwind CSS, Radix UI.
- Design System: DESIGN.md CSS variable tokens, fluid clamp typography, accessible AA deep variants.
- Brand: Configured `src/config/brand.ts` with confirmed brand name "VAP Handicrafts".
- Money: `src/lib/money.ts` integer paise arithmetic with 16 comprehensive unit tests.
- Tokens & Env: `src/lib/contrast.test.ts` (calculated 7.97:1 ring contrast, 5.00:1 button contrast), `src/lib/env.ts` with Zod validation.
- UI Primitives: Button, Label, Input, FormField, Select, Checkbox, Dialog, Drawer, Badge, Price, Container, Section, Heading, VisuallyHidden, SkipLink, LiveRegion.
- Layout: AnnouncementBar, Header with desktop + mobile drawer, Footer.
- Routes: All 20 routes stubbed with honest copy (no dead links).
- Middleware: Deny-by-default 404 protection for `/admin`.
- Security & SEO: next.config.ts security headers (CSP, HSTS, X-Frame-Options DENY), robots.ts, sitemap.ts, scripts/check-secrets.mjs.
- Tests Passed:
  * typecheck: 0 errors
  * vitest: 22/22 unit tests passed
  * check:secrets: 0 secrets detected
  * build: 20/20 routes compiled successfully
  * playwright: 68/68 E2E tests passed (smoke, responsive at 360-1440px, axe 0 violations)
```
