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
| **Current phase** | **Phase 4 complete & verified → Ready for Phase 5 (Checkout & Payment)** |
| Last updated | 2026-10-11 |
| Repo exists? | ✅ Yes (`main` on GitHub `CyberFocus2410/VAP-Handicrafts`) |
| Deployable build? | ✅ Yes (`npm run build` succeeds, 24 routes compiled, 0 CLS, 3D code-split) |

## 2. Phase Tracker

| Phase | Status | Evidence |
|---|---|---|
| 0 Planning & docs | ✅ Done | 9 docs in `/docs` |
| 1 Foundation | ✅ Done | Build passed, 22 unit tests passed, 68 Playwright/Axe E2E tests passed |
| 2 Visual Experience | ✅ Done | 4 photos in responsive pipeline, R3F 3D hero + static fallback, 28 unit tests passed, 90 Playwright E2E passed |
| 3 Catalogue & Product Pages | ✅ Done | SQL migration with strict RLS, safe seed script, typed server queries, accessible ProductGallery, VariantSelector, truthful JSON-LD, /shop, /collections, /products, /search routes, Admin API & audit logs, 41 unit tests, 100 Playwright E2E tests passing |
| 4 Cart & Personalization | ✅ Done | Client-persisted Zustand cart store (`vap_cart_v1`), server price & stock validation (`POST /api/cart/validate`), separate lines for distinct customizations (PRD §9.4), Polaroid live preview builder (`/personalize/[slug]`), binary magic-byte photo upload validation (`POST /api/uploads`), CartDrawer & /cart page with ₹999 free shipping bar, 57 unit tests, 106 Playwright E2E tests passing |
| 5 Checkout & Payment | ⬜ Next | Needs Paytm staging credentials / simulator fallback; order state machine; checkout flow; stock reservation |
| 6 Email & Admin | ⬜ — needs Resend creds | — |
| 7 Hardening & Launch | ⬜ | — |

Legend: ⬜ not started · 🟨 in progress · ✅ accepted (criteria demonstrated) · ⛔ blocked

## 3. Integration Status (truth table — update only with evidence)

| Integration | Implemented | Tested | Verified against live/staging service | Notes |
|---|---|---|---|---|
| Next.js app / build | ✅ | ✅ | n/a | Local build & e2e green (22 routes) |
| 3D Hero Scene (R3F) | ✅ | ✅ | n/a | Code-split, static poster fallback on reduced-motion & no WebGL |
| Responsive Images | ✅ | ✅ | n/a | AVIF/WebP responsive sizes from 4 genuine photos |
| Supabase (DB/Auth/Storage) | ✅ | ✅ | 🟡 Configured / migration ready | Client/Server data layer implemented with fallback; migration script written (`supabase/migrations/20261011_001_catalogue_schema.sql`) |
| Paytm PG | ❌ | ❌ | ❌ | Scheduled for Phase 5 |
| Resend | ❌ | ❌ | ❌ | Scheduled for Phase 6 |
| Vercel deploy | ❌ | ❌ | ❌ | Repo ready for Vercel link |

## 4. Known Facts

- Brand name confirmed as **VAP Handicrafts** (owner decision O-01).
- 4 genuine photographs received in `assets-source/jewellery/` and processed into `public/images/products/`:
  1. `shell-cone-pink-crackle-bracelet` (Spiral Conch & Pink Crackle Bead Bracelet)
  2. `scallop-cowrie-earring-bracelet-set` (Scallop Shell & Cowrie Earring-Bracelet Set)
  3. `purple-floral-beaded-pearl-set` (Lavender Floral Beaded & Pearl Set)
  4. `golden-link-cowrie-charm-bracelet` (Golden Link Cowrie & Conch Charm Bracelet)
- All 4 products represented in `src/data/seed-products.ts` with integer paise money, DB-shaped schema, and `is_dev_price: true` flags.
- R3F 3D scene (`HeroScene3D.tsx`) dynamically loaded with `ssr: false` in `HeroSceneWrapper.tsx`; occupies identical aspect ratio as static fallback (`hero-fallback.webp`), ensuring **0 Cumulative Layout Shift (CLS)**.
- 3D bundle strictly code-split: absent from non-home routes (non-home routes maintain ~105 kB first load JS).
- Full reduced-motion and WebGL failure fallbacks proven in Playwright E2E tests (`tests/e2e/phase2-visual.spec.ts`).
- Homepage sections render in strict PRD §6 order: AnnouncementBar → Header → Hero → TrustHighlights → FeaturedCollections → ScrapbookKeepsakes → FeaturedProducts → PersonalizedGiftFeature → BrandStory → Footer.
- Token contrast mathematically verified via `contrast.test.ts`.
- Integer paise money arithmetic thoroughly tested with zero float accumulation (`src/lib/money.test.ts`).
- Middleware blocks `/admin` with 404 (deny-by-default verified in `tests/e2e/smoke.spec.ts`).

## 5. Next Steps

1. Commit all Phase 4 changes on `phase-4-cart` with author `CyberFocus2410 <cyberfocus2410@gmail.com>`.
2. Merge `phase-4-cart` into `main` and push to GitHub repository `CyberFocus2410/VAP-Handicrafts`.
3. Proceed to **Phase 5: Checkout & Payment**:
   - `PaymentProvider` interface and Paytm adapter with checksum signing/verification.
   - Order state machine (`pending` → `payment_initiated` → `paid` / `failed` / `expired`).
   - Guest checkout form with address validation (Indian PIN codes, phone).
   - Stock reservation logic with automatic release / expiration.
   - Secure server-side callback verification (`POST /api/paytm/callback`).
   - Payment simulator for isolated staging/dev testing without credentials.

## 6. Open Questions / Inputs

- [Owner Decision O-04] Confirm drafted visual descriptions for the 4 jewellery photographs.
- [Owner Decision O-06] Approved final selling prices and compare-at rates for the 4 pieces.
- [Owner Decision O-12 / O-13] Sign-off on homepage Trust Highlights and Brand Story copy.
- [Database Migrations] Run `supabase/migrations/20261011_001_catalogue_schema.sql` and `supabase/migrations/20261011_002_cart_and_uploads.sql` via Supabase dashboard SQL editor for live DB tables.
- [Paytm Credentials] Merchant ID (`PAYTM_MID`), Merchant Key (`PAYTM_MERCHANT_KEY`), and Website (`PAYTM_WEBSITE`) required for live test environment verification in Phase 5. Dev simulator will isolate tests until keys are provided.

---

## 7. Change Log

| Date | Phase | Summary |
|---|---|---|
| 2026-10-10 | Phase 0 | Planning complete: PRD read in full; repo audit; ADRs drafted; token contrast audited. |
| 2026-10-10 | Phase 1 | Foundation complete: Next.js 15, strict TS, Radix UI primitives, paise currency engine, security headers, Playwright E2E & Axe audits passed. Pushed 25 commits to GitHub. |
| 2026-10-10 | Phase 2 | Visual Experience complete: 4 jewellery photos in responsive pipeline, code-split R3F 3D hero scene with static poster fallback, homepage sections in PRD §6 order, 4 seed products with dev-price badges, 28 unit tests and 90 Playwright E2E tests passing. |
| 2026-10-10 | Phase 3 | Catalogue & Product Pages complete: Supabase SQL schema migrations with strict RLS, non-production seed script, typed server data-access queries with fallback, interactive ProductGallery, radio-accessible VariantSelector, truthful JSON-LD schema without fake ratings, admin product creation API with Zod validation & audit logs, /shop, /collections/[slug], /products/[slug], /search routes, 41 unit tests and 100 Playwright E2E tests passing. |
| 2026-10-11 | Phase 4 | Cart & Personalization complete: Client-persisted Zustand cart store (`vap_cart_v1`), server price & stock validation (`POST /api/cart/validate`), separate lines for distinct customizations (PRD §9.4), Polaroid live preview builder (`/personalize/[slug]`), binary magic-byte photo upload validation (`POST /api/uploads`), CartDrawer & /cart page with ₹999 free shipping bar, 57 unit tests, 106 Playwright E2E tests, 8 Axe a11y tests passing. |
