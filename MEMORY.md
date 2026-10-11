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
| **Current phase** | **Phase 6 complete & verified → Ready for Phase 7 (Hardening & Launch)** |
| Last updated | 2026-10-11 |
| Repo exists? | ✅ Yes (`main` on GitHub `CyberFocus2410/VAP-Handicrafts`) |
| Deployable build? | ✅ Yes (`npm run build` succeeds, 36 routes compiled, 0 errors, 3D code-split) |

## 2. Phase Tracker

| Phase | Status | Evidence |
|---|---|---|
| 0 Planning & docs | ✅ Done | 9 docs in `/docs` |
| 1 Foundation | ✅ Done | Build passed, 22 unit tests passed, 68 Playwright/Axe E2E tests passed |
| 2 Visual Experience | ✅ Done | 4 photos in responsive pipeline, R3F 3D hero + static fallback, 28 unit tests passed, 90 Playwright E2E passed |
| 3 Catalogue & Product Pages | ✅ Done | SQL migration with strict RLS, safe seed script, typed server queries, accessible ProductGallery, VariantSelector, truthful JSON-LD, /shop, /collections, /products, /search routes, Admin API & audit logs, 41 unit tests, 100 Playwright E2E tests passing |
| 4 Cart & Personalization | ✅ Done | Client-persisted Zustand cart store (`vap_cart_v1`), server price & stock validation (`POST /api/cart/validate`), separate lines for distinct customizations (PRD §9.4), Polaroid live preview builder (`/personalize/[slug]`), binary magic-byte photo upload validation (`POST /api/uploads`), CartDrawer & /cart page with ₹999 free shipping bar, 57 unit tests, 106 Playwright E2E tests passing |
| 5 Checkout & Payment | ✅ Done | Pure order state machine (`pending` → `payment_initiated` → `paid`/`failed`/`expired`), 15-minute stock hold (ADR-005 Option A), Indian address validation (PIN code + phone), Paytm PG adapter with checksum signing + development payment simulator (`/checkout/simulator`), server-side callback verification (`POST /api/paytm/callback`), Order confirmation view (`/order/[id]`), 73 unit tests passing, Playwright E2E checkout test passing |
| 6 Email & Admin | ✅ Done | Resend client with test domain fallback, Transactional Outbox pattern, Buyer order confirmation + Admin alert + Order shipped templates, Admin orders management dashboard (`/admin/orders`), fulfillment actions (`mark_shipped` with courier + AWB, `mark_fulfilled`), printable workshop packing slip modal, 78 unit tests passing, production build green |
| 7 Hardening & Launch | ⬜ Next | Lighthouse >90 budget audit, rate limiting, Vercel production deployment, final smoke test |

Legend: ⬜ not started · 🟨 in progress · ✅ accepted (criteria demonstrated) · ⛔ blocked

## 3. Integration Status (truth table — update only with evidence)

| Integration | Implemented | Tested | Verified against live/staging service | Notes |
|---|---|---|---|---|
| Next.js app / build | ✅ | ✅ | n/a | Local build & e2e green (36 routes) |
| 3D Hero Scene (R3F) | ✅ | ✅ | n/a | Code-split, static poster fallback on reduced-motion & no WebGL |
| Responsive Images | ✅ | ✅ | n/a | AVIF/WebP responsive sizes from 4 genuine photos |
| Supabase (DB/Auth/Storage) | ✅ | ✅ | ✅ Verified Live Service | All 13 core tables active & seeded; storage bucket `customization-uploads` active; migration 004 created |
| Paytm PG | ✅ Implemented | ✅ Unit & Simulator E2E tested | 🟡 NOT VERIFIED AGAINST LIVE SERVICE (Simulator Active) | Fully working with development simulator; live keys pending owner setup |
| Resend | ✅ Implemented | ✅ Unit & Outbox tested | 🟡 Configured with credentials | API key configured; domain fallback to `onboarding@resend.dev` enabled until custom DNS verified |
| Vercel deploy | ❌ | ❌ | ❌ | Repo ready for Vercel link |

## 4. Known Facts

- Brand name confirmed as **VAP Handicrafts** (owner decision O-01).
- Founders contact info active: **Pulkit Garg (+91 9311516813)** and **Vivan Mittal (+91 9310039258)**; email `vaphandicrafts@gmail.com`; Instagram `@vaphandicraft`.
- Official circular gold emblem logo integrated in Header, Mobile Drawer, and Footer (`/images/brand/logo.webp`).
- Keepsakes boxes removed; replaced with "Personalized Cards", "Cards & Gifts", and "Gift Sets".
- Relationship Licence template (`/personalize/[slug]` with template `relationship_licence`) supports 2-sided card preview, photo upload frame, license holders, valid dates, love code, emergency contact, and terms & conditions.
- Integer paise money arithmetic strictly preserved everywhere with 0 floating point math.
- Order state machine adheres to PRD §12: terminal status immutability (`paid` cannot be overridden by late `failed` callbacks).
- Stock reservation lease timer set to 15 minutes as per ADR-005 Option A.

## 5. Next Steps

1. Run Supabase migrations on live project (`20261011_003_orders_and_payments.sql`).
2. Proceed to **Phase 6: Messaging & Admin**:
   - Order confirmation emails with Resend.
   - Transactional outbox for resilient email dispatch.
   - Admin orders dashboard with status fulfillment controls.

---

## 7. Change Log

| Date | Phase | Summary |
|---|---|---|
| 2026-10-10 | Phase 0 | Planning complete: PRD read in full; repo audit; ADRs drafted; token contrast audited. |
| 2026-10-10 | Phase 1 | Foundation complete: Next.js 15, strict TS, Radix UI primitives, paise currency engine, security headers, Playwright E2E & Axe audits passed. Pushed 25 commits to GitHub. |
| 2026-10-10 | Phase 2 | Visual Experience complete: 4 jewellery photos in responsive pipeline, code-split R3F 3D hero scene with static poster fallback, homepage sections in PRD §6 order, 4 seed products with dev-price badges, 28 unit tests and 90 Playwright E2E tests passing. |
| 2026-10-10 | Phase 3 | Catalogue & Product Pages complete: Supabase SQL schema migrations with strict RLS, non-production seed script, typed server data-access queries with fallback, interactive ProductGallery, radio-accessible VariantSelector, truthful JSON-LD schema without fake ratings, admin product creation API with Zod validation & audit logs, /shop, /collections/[slug], /products/[slug], /search routes, 41 unit tests and 100 Playwright E2E tests passing. |
| 2026-10-11 | Phase 4 | Cart & Personalization complete: Client-persisted Zustand cart store (`vap_cart_v1`), server price & stock validation (`POST /api/cart/validate`), separate lines for distinct customizations (PRD §9.4), Polaroid live preview builder (`/personalize/[slug]`), binary magic-byte photo upload validation (`POST /api/uploads`), CartDrawer & /cart page with ₹999 free shipping bar, 57 unit tests, 106 Playwright E2E tests, 8 Axe a11y tests passing. |
| 2026-10-11 | Phase 5 | Checkout & Payment complete: Brand assets and business card info updated (Pulkit Garg, Vivan Mittal, @vaphandicraft, official logo emblem); keepsakes boxes removed; Relationship Licence template form and Polaroid uploads implemented; pure order state machine with ADR-005 Option A 15-minute stock hold; Indian address validation; Paytm PG adapter with checksum signing + local development payment simulator (`/checkout/simulator`); callback verification (`POST /api/paytm/callback`); Order confirmation view (`/order/[id]`); 73 unit tests passing, Playwright E2E checkout tests passing, Next.js production build passing (27 routes). |
