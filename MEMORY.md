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
| **Current phase** | **Phase 2 complete & verified → Ready for Phase 3 (Catalogue & Product Pages)** |
| Last updated | 2026-10-10 |
| Repo exists? | ✅ Yes (`main` & `phase-1-foundation` on GitHub `CyberFocus2410/VAP-Handicrafts`) |
| Deployable build? | ✅ Yes (`npm run build` succeeds, 20 routes compiled, 3D code-split) |

## 2. Phase Tracker

| Phase | Status | Evidence |
|---|---|---|
| 0 Planning & docs | ✅ Done | 9 docs in `/docs` |
| 1 Foundation | ✅ Done | Build passed, 22 unit tests passed, 68 Playwright/Axe E2E tests passed |
| 2 Visual Experience | ✅ Done | 4 photos in responsive pipeline, R3F 3D hero + static fallback, 28 unit tests passed, 90 Playwright E2E passed |
| 3 Catalogue & Product Pages | ⬜ Next | Supabase DB migrations, RLS, search/filters, variant selector, admin product CRUD |
| 4 Cart & Personalization | ⬜ | — |
| 5 Checkout & Payment | ⬜ — needs Paytm staging creds | — |
| 6 Email & Admin | ⬜ — needs Resend creds | — |
| 7 Hardening & Launch | ⬜ | — |

Legend: ⬜ not started · 🟨 in progress · ✅ accepted (criteria demonstrated) · ⛔ blocked

## 3. Integration Status (truth table — update only with evidence)

| Integration | Implemented | Tested | Verified against live/staging service | Notes |
|---|---|---|---|---|
| Next.js app / build | ✅ | ✅ | n/a | Local build & e2e green |
| 3D Hero Scene (R3F) | ✅ | ✅ | n/a | Code-split, static poster fallback on reduced-motion & no WebGL |
| Responsive Images | ✅ | ✅ | n/a | AVIF/WebP responsive sizes from 4 genuine photos |
| Supabase (DB/Auth/Storage) | ❌ | ❌ | ❌ | Scheduled for Phase 3 |
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

1. Merge `phase-2-visual` to `main` and push to GitHub repository `CyberFocus2410/VAP-Handicrafts`.
2. Review Owner Decisions for Phase 3:
   - Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
   - Confirmation of product titles & alt text descriptions (O-04).
3. Proceed to **Phase 3: Catalogue & Product Pages**.

## 6. Open Questions / Inputs

- [Owner Decision O-04] Confirm drafted visual descriptions for the 4 jewellery photographs.
- [Owner Decision O-06] Approved final selling prices and compare-at rates for the 4 pieces.
- [Owner Decision O-12 / O-13] Sign-off on homepage Trust Highlights and Brand Story copy.
- [Credential] Supabase project credentials for local `.env.local` configuration to begin Phase 3 database migrations.

---

## 7. Change Log

| Date | Phase | Summary |
|---|---|---|
| 2026-10-10 | Phase 0 | Planning complete: PRD read in full; repo audit; ADRs drafted; token contrast audited. |
| 2026-10-10 | Phase 1 | Foundation complete: Next.js 15, strict TS, Radix UI primitives, paise currency engine, security headers, Playwright E2E & Axe audits passed. Pushed 25 commits to GitHub. |
| 2026-10-10 | Phase 2 | Visual Experience complete: 4 jewellery photos in responsive pipeline, code-split R3F 3D hero scene with static poster fallback, homepage sections in PRD §6 order, 4 seed products with dev-price badges, 28 unit tests and 90 Playwright E2E tests passing. |
