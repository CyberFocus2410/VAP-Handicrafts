# RULES.md — Non-Negotiable Project Rules

These rules are distilled from PRD §12, §17, §19, §22, §26, §28. Violating one is a bug, even if the feature "works".
Each rule carries its PRD reference. **MUST / MUST NOT** are absolute.

---

## A. Money & Pricing

- A1. Money **MUST** be stored and computed as **integer minor units (paise)**. **MUST NOT** use floating point for any financial value. (§18.3)
- A2. The browser **MUST NOT** be trusted for price, total, discount, shipping, or stock. The server recomputes everything from DB. (§10.3, §19.3)
- A3. Conversion to/from provider decimal amounts happens in **one** audited function with tests. (§12.4)
- A4. Order items **MUST** snapshot name, SKU, variant, unit price, customization at purchase time. (§13.1, §18.7)
- A5. Production checkout **MUST** block any product without a valid, owner-approved price. (§2.4)

## B. Payments

- B1. Payment initiation and verification **MUST** run server-side only. (§12.2)
- B2. A browser redirect, query string, client flag, screenshot, or uploaded receipt is **NEVER** proof of payment. (§12.4)
- B3. An order becomes `paid` **only** after: valid signature/checksum **AND** server-to-server status confirmation **AND** matching order ref, provider txn ref, merchant, **exact amount**, currency, and `success` status. (§12.3–12.4)
- B4. Payment/order transitions **MUST** go through the explicit state machine, inside a DB transaction with row locking. Invalid transitions are rejected. (§12.5)
- B5. A late `failed`/`cancelled` callback **MUST NOT** overwrite a verified `success`. (§12.5)
- B6. Duplicate callbacks **MUST NOT** create a second paid transition, second stock deduction, or second email. (§12.5, §14.4)
- B7. Pending/uncertain payments **MUST** show "verifying" — not "failed" — and be re-checked via provider status API. (§12.6)
- B8. Admin UI **MUST NOT** be able to set a payment to paid via a dropdown/field. Manual reconciliation = separate gated action that re-queries the provider + audit entry. (§15.4)
- B9. **No mock payment success in production code.** Dev simulator **MUST** be excluded from production builds and rejected at runtime if `APP_ENV=production`. (§28.2–28.3)
- B10. **MUST NOT** invent Paytm endpoints, parameters, or checksum schemes. Use **current official Paytm documentation**; record the doc URL + date consulted in `DECISIONS.md`. (§12.2)
- B11. **MUST NOT** store UPI PINs or card/payment credentials. (§19.2)
- B12. If direct-UPI/QR is ever chosen, automatic verification **MUST NOT** be promised without a real verification integration. Do not mix simulated, direct-UPI and gateway flows. (§12.7)

## C. Secrets & Environments

- C1. Secrets live in server-side env vars only. **MUST NOT** appear in client bundles, repo, logs, or `.env.example`. (§12.2, §28.4)
- C2. Only variables prefixed `NEXT_PUBLIC_` may reach the client, and none may be secret. `env.ts` (Zod) enforces the split and fails fast.
- C3. The Supabase **service-role key is server-only** and used only in `server/` modules. (§17.4)
- C4. Production and development environments are separated (separate Supabase projects, Paytm staging vs live keys, separate Resend keys). (§19.1)
- C5. **MUST NOT** log secrets, full payment payloads, or unnecessary PII. (§12.8, §18.12)
- C6. Seed/dev scripts **MUST** refuse to run when `APP_ENV=production`.

## D. Data Access & Authorization

- D1. **RLS enabled on every table** reachable via client APIs, with explicit policies; default deny. (§17.4)
- D2. Every admin operation (route handler **and** server action **and** data function) enforces authorization **server-side**. Hiding links is not access control. (§15.1)
- D3. No cross-customer access. Order status requires an authenticated owner session **or** a high-entropy, hashed, expiring access token. **No sequential/guessable IDs in URLs.** No PII in URLs. (§13.3, §19.3)
- D4. Customer uploads live in a **private** bucket under randomized keys. Access only via short-lived signed URLs for authorized staff. Never in public/indexable paths. (§9.3)
- D5. File validation is server-side: magic-byte sniffing, size cap, allow-list of types; **never trust filename or client MIME alone.** Re-encode images (strip EXIF/GPS). (§9.3)
- D6. Authorization is tested as **anon**, **customer**, **admin** identities. (§17.4, §23.2)
- D7. Admin mutations write to `admin_audit_logs` (non-sensitive metadata only). (§15.1, §18.12)

## E. Email

- E1. Emails are triggered **only** by the backend **after verified payment**. (§14.4)
- E2. Use a **DB-backed outbox** with unique `event_key` (`owner_order_paid:{order_id}`, `buyer_receipt:{order_id}`). Outbox rows are inserted in the same transaction as the paid transition. (§14.4)
- E3. Email failure **MUST NOT** roll back or alter a successful payment. Customer success page **MUST NOT** depend on the email provider. (§14.4, §22.3)
- E4. Failed emails are retried with backoff and can be manually retried by admin. (§14.4)
- E5. Receipts **MUST NOT** be presented as a GST tax invoice unless tax settings are configured. **Never invent GSTIN, tax rate, or invoice numbers.** (§14.3)

## F. Honesty of Content & UX

- F1. **MUST NOT** fabricate reviews, ratings, sales counts, stock scarcity ("only 2 left" unless true), certifications, or product claims. (§2.4, §26)
- F2. **MUST NOT** claim "handmade", "natural", "genuine shell", etc. unless the owner confirms. (§6.4)
- F3. **MUST NOT** hardcode promotions or free-shipping thresholds. They are admin-configured. (§6.1)
- F4. No dead buttons, placeholder `#` links, or decorative controls that look functional. Wishlist icon only if wishlist is real. (§6.6, §28.2)
- F5. Initial products use the **owner-supplied photographs**. **MUST NOT** substitute stock imagery. Preserve aspect ratio and important details. (§4.5, §8.1)
- F6. Never show "added to cart" when validation or stock check failed. (§8.3)
- F7. Do not report a conversion on landing at `/payment/return`; purchase analytics fire only from the verified backend result. (§21.2)

## G. Engineering Standards

- G1. TypeScript **strict**; no `any` without a commented justification; no `@ts-ignore` without justification.
- G2. All external input (API bodies, query params, form data, env, provider callbacks) validated with **Zod** at the boundary. (§28.2)
- G3. Business logic (payment, inventory, orders, email) lives in `src/server/**` / `src/features/**/domain` — **never in presentational components.** (§17.2)
- G4. Schema changes **only** via versioned migrations. No manual dashboard edits that aren't captured. (§28.2)
- G5. Parameterized queries / the Supabase client only. No string-built SQL. (§19.1)
- G6. Friendly customer errors; detailed diagnostics server-side only. No stack traces, SQL, env, or provider payloads to clients. (§19.5)
- G7. Rate-limit sensitive endpoints: auth, checkout, upload, callbacks, search (if abusable). (§12.8, §19.1)
- G8. Security headers set (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors). (§19.1)
- G9. Don't rely on in-memory state across serverless invocations. (§17.5)
- G10. Meaningful loading, empty, success, and error states for every async UI. (§28.2)

## H. Design, Motion & Accessibility

- H1. Design values come from tokens in `DESIGN.md`. No ad-hoc hex codes in components.
- H2. Target **WCAG 2.2 AA**: semantic HTML, visible focus, keyboard operability, accessible forms and errors, contrast ≥ 4.5:1 text / 3:1 UI. (§20.2)
- H3. Respect `prefers-reduced-motion`; preserve all functionality. (§16.5)
- H4. 3D is **lazy, client-only, optional.** Site fully usable without WebGL. 3D must never block nav, CTA, cart, or checkout. No CLS from canvases. (§16.6–16.7)
- H5. No hover-only functionality; touch targets ≥ 44×44 CSS px on mobile. (§7.3, §20.2)
- H6. One animation system by default (Framer Motion + CSS). GSAP only with an ADR and a concrete need. (§16.1)
- H7. Mobile layouts are **re-composed**, not shrunk desktop layouts. (§4.4)
- H8. Never hide content permanently behind an animation (`opacity:0` with no fallback). (§16.7)

## I. Scope Control

- I1. Do **not** build PRD §26 items (native apps, AI recommendations, marketplace, loyalty, subscriptions, per-product 3D configurators, print/manufacturing integrations, courier aggregation, multi-currency, multi-language, marketing automation, invented reviews) without an approved ADR.
- I2. Account area (`/account`) may be deferred; **guest checkout must always work**. (§5)
- I3. Don't add libraries "just in case". Each dependency must earn its place.

## J. Process

- J1. One phase at a time; acceptance criteria must be demonstrated before moving on.
- J2. Production build passes at every milestone. (§28.2)
- J3. Tests ship with critical logic: pricing, shipping, validation, state machines, idempotency, outbox. (§23.1)
- J4. Update `MEMORY.md` and `DECISIONS.md` at the end of each task/phase.
- J5. Report with the PRD §28.5 format. Never claim integrations work without a real passing run.
- J6. If you can't do something (missing credentials, ambiguous requirement), **say so and document it** — do not paper over it.

---

## Pre-Merge Checklist

```
[ ] typecheck / lint / unit / build pass (output attached)
[ ] No secrets or real customer data committed (check:secrets)
[ ] Prices/totals/stock never taken from client
[ ] Payment state changes only via state machine (if touched)
[ ] New endpoint: Zod-validated, authz-checked, rate-limited
[ ] New table: RLS + policies + tests as anon/customer/admin
[ ] New UI: keyboard, focus, contrast, reduced-motion, mobile checked
[ ] No dead links/buttons; empty/loading/error states present
[ ] Docs updated (MEMORY, DECISIONS, ARCHITECTURE as needed)
[ ] Claims in PR match what was actually run
```
