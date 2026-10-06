# ARCHITECTURE.md — Technical Architecture

Implements PRD §17 (stack/boundaries), §18 (database), §12–14 (payments, orders, email), §19 (security).
Status legend: **[Decided]** = follows the PRD · **[Proposed]** = my recommendation, logged in `DECISIONS.md` for owner/lead sign-off · **[Verify]** = depends on an external fact that must be checked against current official docs before implementation.

---

## 1. Stack [Decided per PRD §17.1]

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript `strict` |
| Styling | Tailwind CSS + CSS-variable tokens (`DESIGN.md`) |
| Components | Radix UI primitives (accessible) wrapped in `components/ui` |
| Animation | Framer Motion (+ CSS) |
| 3D | three + @react-three/fiber + @react-three/drei |
| Database | PostgreSQL via **Supabase** |
| Auth | Supabase Auth (admin first; customers optional/deferred) |
| Storage | Supabase Storage (public bucket for product images; **private** bucket for customer uploads) |
| Payments | Paytm Payment Gateway (server-side only) |
| Email | Resend + React Email |
| Hosting | Vercel |
| Validation | Zod |
| Tests | Vitest, Testing Library, Playwright, axe |
| CI | GitHub Actions |

**Library versions:** pin at Phase 1 from the then-current stable releases; do **not** copy versions from this document. [Verify]

### Proposed additions [Proposed] (see DECISIONS ADR-003/004/008)
- **State:** Zustand (cart) with `persist` — small, no provider tree.
- **Rate limiting:** Upstash Redis (`@upstash/ratelimit`) *or* Postgres-backed limiter — serverless-safe (in-memory limiters do not work on serverless, PRD §17.5).
- **Image processing:** `sharp` (server-side re-encode of uploads, strips metadata).
- **Money:** own tiny `lib/money.ts` (integer paise); no float libs.
- **Migrations:** Supabase CLI SQL migrations (plain SQL, reviewable, RLS in same files).

---

## 2. High-Level Architecture

```
                         ┌────────────────────────────── Vercel ──────────────────────────────┐
 Browser                 │                                                                    │
 ┌──────────────┐  RSC   │  Next.js App Router                                                │
 │ Storefront   │◄──────►│  ├─ app/(store)/…        Server Components (catalogue, SEO)         │
 │ (React, 3D   │  fetch │  ├─ app/(checkout)/…     Calm, no-3D transactional UI               │
 │  lazy)       │───────►│  ├─ app/admin/…          Guarded by middleware + server authz       │
 │ Cart in      │        │  ├─ app/api/…            Route handlers (validated, rate-limited)   │
 │ localStorage │        │  │    cart/validate  checkout  uploads  payments/callback  cron/…   │
 └──────────────┘        │  └─ server/…             ALL business logic (no UI imports)         │
                         └───────┬──────────────┬──────────────────┬───────────────┬──────────┘
                                 │              │                  │               │
                          Supabase Postgres   Supabase Storage   Paytm PG        Resend
                          (RLS, txns, outbox) (public + private) (initiate,     (transactional
                                                                  callback,       email)
                                                                  status API)
```

Principles: **server is the only authority** for price, stock, payment state, email, and admin permission. The browser holds only a *proposal* (cart intent).

---

## 3. Repository Structure [Decided: modular per PRD §17.2]

```
/
├─ docs/                      PRD.md AGENTS.md RULES.md MEMORY.md DECISIONS.md PLAN.md DESIGN.md ARCHITECTURE.md
│                             (+ SECURITY.md DEPLOYMENT.md TESTING.md PAYMENTS.md EMAIL.md OWNER_DECISIONS.md as created)
├─ supabase/
│  ├─ migrations/             0001_init.sql … (RLS + constraints included)
│  ├─ seed/                   dev-only seed (refuses APP_ENV=production)
│  └─ tests/                  SQL/RLS tests
├─ public/                    static assets (NO customer data, NO secrets)
├─ scripts/                   check-secrets, image pipeline, seed runner
├─ src/
│  ├─ app/
│  │  ├─ (store)/             / shop collections/[slug] products/[slug] search cart personalize/[slug] about contact policies…
│  │  ├─ (checkout)/          checkout payment/return order-status/[reference]
│  │  ├─ account/             deferred
│  │  ├─ admin/               layout-level auth gate + sections
│  │  ├─ api/                 route handlers (thin: parse → call server/ → respond)
│  │  ├─ dev/                 payment-simulator (stripped from prod build)
│  │  ├─ robots.ts  sitemap.ts  layout.tsx  not-found.tsx  error.tsx
│  ├─ components/
│  │  ├─ ui/                  design-system primitives
│  │  ├─ layout/              Header Footer AnnouncementBar
│  │  └─ 3d/                  R3F scenes (dynamic, client-only)
│  ├─ features/               UI + hooks per domain (presentational only)
│  │  ├─ catalogue/ cart/ checkout/ personalization/ admin/ …
│  ├─ server/                 ★ business logic — no React imports
│  │  ├─ catalogue/           queries, search
│  │  ├─ pricing/             price + shipping + discount calc (pure)
│  │  ├─ cart/                validation (pure + DB)
│  │  ├─ orders/              create, state machine, snapshots, access tokens
│  │  ├─ inventory/           reserve/deduct/release (transactional)
│  │  ├─ payments/
│  │  │   ├─ provider.ts      PaymentProvider interface
│  │  │   ├─ paytm/           real adapter (+ checksum, status, callback)
│  │  │   ├─ simulator/       DEV ONLY
│  │  │   ├─ state-machine.ts pure
│  │  │   └─ reconcile.ts
│  │  ├─ uploads/             signing, sniffing, re-encode, signed-URL access
│  │  ├─ email/               outbox, worker, templates, transport
│  │  ├─ admin/               guards, audit log, settings
│  │  ├─ auth/                session helpers, requireAdmin()
│  │  ├─ security/            rate limit, headers helpers, token utils
│  │  └─ db/                  supabase clients (anon / user / service), typed queries
│  ├─ lib/                    money.ts, format.ts, slug.ts, zod schemas shared client+server
│  ├─ config/                 brand.ts, nav.ts, env.ts (Zod, split server/client)
│  ├─ styles/                 globals.css (tokens)
│  └─ middleware.ts           admin gate, security headers, noindex for private routes
├─ tests/                     unit/ integration/ e2e/ a11y/ security/
├─ .env.example               names only, no values
├─ .github/workflows/ci.yml
├─ next.config.ts  tailwind.config.ts  tsconfig.json  vitest.config.ts  playwright.config.ts
└─ README.md
```

**Boundary rule (PRD §17.2):** `features/` and `components/` **never** import from `server/` payment/inventory/order internals; they call route handlers/server actions that call `server/`. Enforce with an ESLint `no-restricted-imports` rule. `server/**` files that touch secrets start with `import 'server-only'`.

---

## 4. Data Model [Decided: PRD §18 minimum; additions marked +]

All money = **integer paise** (`*_minor`, `bigint` or `integer` with CHECK ≥ 0). All tables: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at` (trigger). RLS **enabled on all**.

```
categories ──< products ──< product_variants
     │              └──< product_images
     └ parent_id (self)

carts (optional server persistence) ──< cart_items          [Proposed: client-first; see ADR-003]

orders ──< order_items ──< uploaded_assets
   │└──< payments ──< payment_events
   │└──< email_outbox
   └── order_access_tokens (+)

site_settings (+)        key/value JSONB: brand, announcement, shipping rules, policies, owner email
admin_users (+)          user_id → role (owner|staff), is_active
admin_audit_logs
personalization_templates (+)   per-product field schema (JSONB, validated)
```

### Key columns & constraints (beyond PRD lists)
- `products`: `status` enum(`draft|active|archived`), `fulfilment_type` enum(`tracked|made_to_order|untracked`), `personalization_schema jsonb null` (+), `seo_title`, `seo_description`, `is_bestseller`, `is_new_arrival`, `search_tsv tsvector` generated + GIN index.
- `product_variants`: `sku unique`, `price_minor int CHECK (>=0)`, `compare_at_price_minor CHECK (> price_minor OR null)`, `stock_quantity int null CHECK (>=0)`, `attributes jsonb` validated by Zod at write; **price_is_placeholder boolean** (+) so production checkout can refuse placeholder prices.
- `orders`: `public_reference text unique` (human-friendly, e.g. `XXXX-XXXX` from unambiguous alphabet — random, **not sequential**), `payment_status` enum, `fulfilment_status` enum, `total_minor = subtotal + shipping − discount` enforced by CHECK, `shipping_address jsonb` (validated snapshot), `idempotency_key text unique` (+) for create-order retries.
- `order_items`: snapshots (name, sku, variant, unit price, customization); `product_id`/`variant_id` **nullable, ON DELETE SET NULL** so history survives.
- `payments`: `unique(provider, provider_order_reference)`, `unique(provider, provider_transaction_reference) WHERE NOT NULL`, `provider` enum includes `simulator` (blocked in prod verification).
- `payment_events`: `unique(payment_id, provider_event_reference) WHERE NOT NULL` for dedupe; stores *minimal* fields + a hash of raw payload, not the payload.
- `email_outbox`: `unique(event_key)`; status enum (`pending|sending|sent|failed|dead`); `next_attempt_at`; `locked_at`.
- `uploaded_assets`: status (`pending|attached|rejected|deleted`), `deleted_at`, `expires_at` for orphan cleanup.
- `order_access_tokens` (+): `token_hash` (SHA-256 of ≥128-bit random token), `order_id`, `expires_at`, `revoked_at`. Raw token only ever in the email link / post-checkout redirect.

### Indexes
`products(status, category_id)`, `products USING gin(search_tsv)`, `product_variants(product_id)`, `orders(public_reference)`, `orders(payment_status, created_at desc)`, `orders(fulfilment_status, created_at desc)`, `payments(order_id)`, `email_outbox(status, next_attempt_at)`.

### RLS model
| Table group | anon | authenticated customer | admin (via `admin_users`) |
|---|---|---|---|
| categories, products (active), variants (active), images | SELECT active only | same | full (through server) |
| orders, order_items, payments, payment_events, email_outbox, uploaded_assets, audit logs, settings (private), admin_users | **none** | own orders only (if accounts) | read via server; writes only via server functions |
| site_settings (public subset: announcement, brand, shipping rules) | SELECT public keys only | same | write |

**Privileged writes (orders, payments, stock, outbox) happen only through server code using the service-role client**, never from the browser. RLS is the safety net, not the only gate. Test as 3 identities (PRD §17.4).

---

## 5. Pricing, Cart & Checkout

### 5.1 Cart (client) [Proposed ADR-003]
- Zustand + `persist` (localStorage), schema-versioned; on parse failure → reset gracefully, notify user (PRD §22.1 "cart contents lost or corrupted").
- Line = `{ lineId (uuid), productId, variantId, quantity, customization, uploadIds[] }`. **No price fields trusted.** Display prices come from the last server validation response.
- Same product + different customization ⇒ different `lineId` (PRD §9.4). Same product + identical customization + no uploads ⇒ merge quantity.

### 5.2 Server validation `POST /api/cart/validate`
`input(Zod)` → load active variants + products → verify IDs, `is_active`, status → quantity bounds & stock → customization against product schema → price via `server/pricing` → shipping via settings rules → returns **authoritative cart** + `notices[]` (price changed, stock reduced, item unavailable). Used by cart page, checkout page, and `createOrder`.

### 5.3 Pricing (pure functions, unit-tested)
`subtotal = Σ unit_price_minor × qty` · `discount` (disabled until a discount feature is approved) · `shipping = rules(settings, subtotal, address.state/pin)` · `total = subtotal − discount + shipping`. Rules come from `site_settings`, **never hardcoded**. Free-shipping threshold exists only if configured.

### 5.4 Create Order (single DB transaction) — PRD §11.3
```
1. Zod-validate customer + address + cart + idempotency_key
2. Re-run cart validation (fresh prices & stock). If notices ⇒ return 409 with notices (customer must confirm)
3. Compute totals (server)
4. BEGIN
   - insert order (pending), order_items (snapshots), link uploaded_assets
   - stock policy (ADR-005): conditional decrement  UPDATE … SET stock = stock − :q WHERE id=:id AND stock >= :q
     (fails ⇒ rollback ⇒ "no longer available")
   - insert payment (status=created, amount = order.total_minor)
   - insert order_access_token (hashed)
   COMMIT
5. provider.initiate(order, payment)  — outside the DB txn; on failure mark payment failed + release stock
6. persist provider_order_reference; payment → pending
7. return {redirect/params} to client
```
Retry with the same `idempotency_key` returns the existing order/payment instead of creating a duplicate.

### 5.5 Stock policy [Proposed ADR-005 — owner decision]
Two options; recommend **A**:
- **A. Reserve at order creation, release on failure/expiry** — prevents overselling during payment; needs an expiry job (stale `pending` > N minutes → `expired` → stock released). Reservation must be **released only after reconciliation confirms the payment did not succeed** (never release while a payment could still land).
- **B. Deduct only on verified payment** — simpler, but two buyers can both pay for the last item ⇒ requires refund path.
Made-to-order and untracked products skip stock logic.

---

## 6. Payments [Verify against current official Paytm docs in Phase 5]

> **Policy (RULES B10):** I will not invent Paytm endpoints, parameter names, or checksum details. This section defines *our* contract and invariants; the Paytm-specific adapter is written from the official docs at implementation time, and the exact docs URL + date are recorded in `DECISIONS.md`.

### 6.1 Provider abstraction
```ts
interface PaymentProvider {
  readonly id: 'paytm' | 'simulator';
  initiate(input: { orderRef: string; amountMinor: number; currency: 'INR'; customer: {...}; callbackUrl: string }):
     Promise<{ providerOrderRef: string; clientAction: ClientAction }>;
  verifyCallback(raw: unknown, headers: Headers): Promise<VerifiedCallback | VerificationFailure>; // signature/checksum
  fetchStatus(providerOrderRef: string): Promise<ProviderStatus>;      // server-to-server
  refund?(…): Promise<RefundResult>;
}
```
`ProviderStatus` is normalized to `{ state, providerTxnRef, amountMinor, currency, merchantId }`; adapter performs paise↔provider-decimal conversion in one place.

### 6.2 Confirmation algorithm (provider-agnostic) — PRD §12.3–12.5
```
onCallback(raw):
  v = provider.verifyCallback(raw)                      // signature/checksum  → reject if invalid (log, 400, no state change)
  payment = find by providerOrderRef                    // must exist & match expected order
  status = provider.fetchStatus(providerOrderRef)       // never trust callback body alone
  assert status.merchantId == ours
  assert status.amountMinor == payment.amount_minor     // exact
  assert status.currency == 'INR'
  assert status.providerOrderRef == payment.provider_order_reference
  BEGIN
    SELECT … FROM payments WHERE id=… FOR UPDATE
    next = stateMachine(payment.status, status.state)   // pure; success is terminal vs late failed
    if next == payment.status: record dedupe event; COMMIT; return   // idempotent
    update payment; if next==success: order.payment_status='paid', paid_at=now(),
        insert email_outbox rows (2, unique event_keys); (stock already reserved, or deduct per ADR-005)
    insert payment_events (deduped)
  COMMIT
```
`/payment/return` **only** reads status from our DB (and may trigger a `fetchStatus` re-check); it never accepts a success flag from the URL.

### 6.3 State machines (pure, exhaustively tested)
Payment: `created → pending → (success | failed | cancelled | expired)`; `success → (refunded | partially_refunded)`; `partially_refunded → refunded`. **Forbidden:** any transition out of `success` except to refund states; `failed/cancelled/expired → success` allowed **only** through a verified provider status (late success after cancel can legitimately happen) — recorded + audited.
Fulfilment: `unfulfilled → processing → packed → shipped → delivered`; `cancelled` and `returned` branches; independent of payment state.
> Whether `failed/expired → success` is permitted is a subtle edge (customer pays after we expired the order). Resolution proposed in ADR-010: allow only via reconciliation that confirms amount/ref, then flag for owner review if stock was already released.

### 6.4 Reconciliation
Cron-driven job rechecks `pending` payments older than N minutes via `fetchStatus`, expires stale ones after a configured window (only after provider confirms non-success), and surfaces mismatches in the admin dashboard.

### 6.5 Dev simulator
Lives in `server/payments/simulator` + `app/dev/payment-simulator`. Excluded from production via: (1) `if (env.APP_ENV === 'production')` hard throw at import; (2) route returns 404 in prod; (3) CI test builds with production env and asserts the simulator route/module is absent; (4) payments created by it carry `provider='simulator'`, which production verification **rejects**.

### 6.6 Webhook vs return URL
Paytm may provide server callback(s) and/or a browser return; exact options are **[Verify]**. Design supports both: either path funnels into the same `onCallback` idempotent algorithm.

---

## 7. Personalization & Uploads

### 7.1 Field schema
`products.personalization_schema` (JSONB) = list of fields `{ key, type: text|textarea|name|date|select|template|photo|instructions, label, required, constraints }`. Server compiles it into a Zod schema at validation time. Validation occurs at: add-to-cart (UX), cart/validate, createOrder. **Customization snapshot is stored on `order_items` after validation.**

### 7.2 Upload pipeline (PRD §9.3) [Proposed ADR-008]
Vercel functions have request-body size limits **[Verify current limit]**, so photos upload **directly to Supabase Storage** via short-lived signed upload URLs:
```
1. client → POST /api/uploads/sign {filename, size, declaredType}   (rate-limited, size/type pre-check)
2. server → creates uploaded_assets(status=pending), returns signed upload URL to a RANDOM key  private/uploads/{uuid}.bin
3. client uploads directly
4. client → POST /api/uploads/confirm {assetId}
5. server downloads first bytes → magic-byte sniff (JPEG/PNG/WebP/HEIC?) → size check → decode & re-encode with sharp (strip EXIF/GPS) → store final → status=pending→ready; else delete + reject
6. at createOrder: assets bound to order_item (status=attached); orphans (pending/ready but unattached > 24h) purged by cron
```
Staff access: `GET /api/admin/uploads/:id` → `requireAdmin()` → audit log → 60s signed URL. Owner email contains links to this authenticated route (not raw storage URLs).
Retention/deletion window: **owner decision** (default proposal: delete N days after delivery; N to be set — do not invent).

---

## 8. Email [PRD §14]

- `email_outbox` rows inserted in the paid-transition transaction: `owner_order_paid:{order_id}` and `buyer_receipt:{order_id}` (unique).
- **Worker** `processOutbox()`: `SELECT … WHERE status IN ('pending','failed') AND next_attempt_at <= now() ORDER BY … FOR UPDATE SKIP LOCKED LIMIT n` → render React Email → send via Resend with **Resend idempotency key = event_key** [Verify supported] → mark `sent` / bump `attempt_count` with exponential backoff → `dead` after max attempts → admin alert.
- **Triggers:** (a) opportunistic: invoke worker via Next `after()`/background after paid transition so emails go out in seconds; (b) scheduled sweeper for retries (ADR-009).
- **Scheduler caveat [Verify]:** Vercel Cron frequency limits depend on plan (Hobby is restricted). Options: Vercel Pro cron, Supabase `pg_cron` + Edge Function, or an external scheduler hitting a secret-protected route. Decide before Phase 5/6.
- Cron/worker routes require `Authorization: Bearer ${CRON_SECRET}`.
- Owner email lists items, personalization, and **links** (not attachments) to files. Buyer email = order confirmation + payment receipt (**not a tax invoice** unless tax settings exist).
- `EMAIL_TRANSPORT=resend|console`; `console` forbidden in production (startup assert).

---

## 9. Admin

- **Auth:** Supabase Auth (email+password or magic link; optional MFA — owner decision) → session cookie → `admin_users` allow-list check.
- **Gate in depth:** (1) `middleware.ts` blocks unauthenticated `/admin/*`; (2) `admin/layout.tsx` calls `requireAdmin()`; (3) **every** server action/route handler/data function calls `requireAdmin(role?)` again; (4) RLS denies direct DB access. Unauthorized requests → 404 (don't reveal existence) for pages, 401/403 for APIs.
- **Audit:** `withAudit(action, entity)` wrapper writes `admin_audit_logs` (actor, action, entity, non-sensitive metadata).
- **Sections:** Overview metrics · Orders · Products · Inventory · Categories · Emails (outbox) · Settings · Audit log.
- **Payment status is read-only** in UI. Refund and manual-reconcile are separate permissioned actions that call the provider.
- Rate-limit login attempts (Supabase has built-ins; add app-level limiter too).

---

## 10. Security Architecture [PRD §19]

| Concern | Control |
|---|---|
| Input | Zod at every boundary (route, action, env, provider callback) |
| SQLi | Supabase client / parameterized queries only; RPCs for transactions |
| XSS | React escaping; no `dangerouslySetInnerHTML` except sanitized policy HTML (or use Markdown + sanitizer); strict CSP (nonce-based for inline) |
| CSRF | Server Actions' origin checks + SameSite=Lax cookies; JSON route handlers verify `Origin`/custom header; **payment callbacks are exempt from CSRF but require signature verification** |
| Secrets | Server env only; `server-only` imports; secret scan in CI; never `NEXT_PUBLIC_` |
| Sessions | httpOnly, Secure, SameSite cookies (Supabase SSR helpers) |
| IDOR | Order access via hashed token/owner session; admin file access audited |
| Rate limiting | Login, checkout, uploads, cart/validate, callback, search |
| Headers | CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'` |
| Logging | Structured; redaction of secrets/PII; no raw payment payloads |
| Errors | Generic customer messages; correlation ID shown; details server-side |
| Deps | `npm audit` in CI, Dependabot/Renovate |
| Private pages | `noindex` + `robots` Disallow + `Cache-Control: no-store` for order/payment/admin |
| Uploads | See §7.2 |

---

## 11. Rendering & Performance

- **Server Components by default;** client components only for interactivity (cart, filters, gallery, forms, 3D).
- **Catalogue pages:** ISR/`revalidateTag` on product mutation (admin saves trigger revalidation) — but **price/stock shown at add-to-cart/checkout always re-validated live**.
- `/cart`, `/checkout`, `/payment/*`, `/order-status/*`, `/admin/*`: dynamic, `no-store`.
- **Images:** `next/image`, AVIF/WebP, explicit dimensions, priority only for LCP hero.
- **3D:** `next/dynamic({ ssr:false })`, in-view mount, static poster; separate chunk.
- **Fonts:** `next/font` with `display: swap`, subset.
- **Budgets:** record baseline in Phase 2; add Lighthouse CI thresholds from measured values (PRD targets LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 are **field targets to validate**, not guarantees).

---

## 12. Environment Configuration

`src/config/env.ts` parses with Zod; separate `serverEnv` (imports `server-only`) and `clientEnv`. App **fails to boot** on missing/invalid required vars (except those gated by feature flags in dev).

```
# .env.example  — NAMES ONLY, NO SECRET VALUES
APP_ENV=development                 # development | staging | production
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # SERVER ONLY

# Payments
PAYMENT_PROVIDER=simulator          # simulator | paytm   (simulator forbidden when APP_ENV=production)
PAYTM_ENV=staging                   # staging | production
PAYTM_MID=
PAYTM_MERCHANT_KEY=                 # SERVER ONLY
PAYTM_WEBSITE=                      # per Paytm docs [Verify]
PAYTM_CALLBACK_URL=
# (additional Paytm vars per official docs at Phase 5)

# Email
EMAIL_TRANSPORT=console             # console | resend (console forbidden in production)
RESEND_API_KEY=                     # SERVER ONLY
EMAIL_FROM=
OWNER_NOTIFICATION_EMAIL=           # may also be admin-configurable setting

# Security / jobs
CRON_SECRET=                        # SERVER ONLY
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=           # SERVER ONLY
ORDER_TOKEN_PEPPER=                 # SERVER ONLY (optional HMAC pepper)

# Observability (owner decision)
SENTRY_DSN=
```

Startup assertions (production): `PAYMENT_PROVIDER==='paytm'`, `PAYTM_ENV==='production'`, `EMAIL_TRANSPORT==='resend'`, no `localhost` URLs, all secrets present.

---

## 13. Deployment [PRD §17.5]

- Environments: **local** (Supabase CLI/Docker), **preview** (Vercel PR deploys → dev/staging Supabase + Paytm *staging*), **production**.
- Vercel: env vars per environment; production vars not exposed to preview. Domain + HTTPS documented in `DEPLOYMENT.md`.
- DB migrations applied via CI/CD step before promoting (never auto-run destructive migrations on prod without review).
- Paytm callback URL must be a publicly reachable HTTPS URL **and may require whitelisting** [Verify] → preview deploys may not be usable for gateway testing; use a stable staging domain.
- Backups: Supabase backups/PITR (plan-dependent **[Verify]**), restore drill documented in Phase 7.
- No reliance on in-memory state; no local-filesystem writes at runtime; long tasks → outbox/cron.

---

## 14. Testing Architecture (PRD §23)

| Concern | Approach |
|---|---|
| Pure logic | Vitest: money, pricing, shipping, validators, state machines, event keys |
| DB-backed | Vitest + local Supabase (`supabase start`) with migrations applied; transaction/idempotency/concurrency tests (parallel callbacks → exactly one paid transition, one stock decrement, two outbox rows) |
| RLS | Run queries as anon / customer / admin JWTs; assert allow/deny matrix |
| Provider | Fixture-based Paytm tests (clearly labelled "fixtures — not live"); **live staging test is a separate manual/gated suite** |
| E2E | Playwright: PRD §23.3 journeys; simulator used only in test env |
| Security | Price-tamper, IDOR on `/order-status`, admin route bypass, upload abuse (`.exe` as `.jpg`, oversize, polyglot), forged callback, replayed callback |
| A11y | `@axe-core/playwright` on all routes + manual keyboard/SR pass |

---

## 15. Open Technical Questions (tracked in DECISIONS.md)

1. Stock reservation policy (A vs B) — ADR-005
2. Cron/worker scheduler given Vercel plan — ADR-009
3. Late-success-after-expiry handling — ADR-010
4. Customer accounts at launch? (PRD: optional) — ADR-011
5. Rate-limit backing store — ADR-004
6. Error monitoring vendor — owner decision
7. Exact Paytm API surface, callback vs webhook, refund API — **[Verify] at Phase 5**
