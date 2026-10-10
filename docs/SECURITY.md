# SECURITY.md — Security Architecture & Guidelines

This document outlines the security controls, policies, and threat mitigations implemented across the VAP Handicrafts application, enforcing [RULES.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/RULES.md) Sections B, C, and D.

---

## 1. Zero Trust Client Principles

1. **Integer Minor Units:** All monetary math is handled as integer minor units (paise) on the server. The client is never trusted for totals, prices, or discounts.
2. **Server-Authoritative Pricing:** The cart stored in browser localStorage contains only user intent (product IDs, variant selections, quantities). The server validates and recomputes all prices directly from the database.
3. **No Direct Mark Paid:** Payment callbacks and webhook events require cryptographic checksum validation and server-to-server gateway status verification. Client redirects or return query parameters are never treated as proof of payment.

## 2. Environment Variables & Secret Separation

- **Zod Validation (`src/lib/env.ts`):** Environment variables are strictly parsed and typed at startup.
- **Client vs Server Boundary:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client bundle. Any attempt to access server keys (such as `PAYTM_MERCHANT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `CRON_SECRET`) on the client fails fast.
- **Automated Secret Scanning:** An automated scanner (`npm run check:secrets`) runs as a mandatory CI step to detect accidental credential commits.

## 3. HTTP Security Headers

Enforced in `next.config.ts`:
- **Content Security Policy (CSP):** Restricts script, style, and object execution.
- **Strict-Transport-Security (HSTS):** Enforces HTTPS with `max-age=63072000; includeSubDomains; preload`.
- **X-Frame-Options:** `DENY` and `frame-ancestors 'none'` to prevent clickjacking.
- **X-Content-Type-Options:** `nosniff` preventing MIME confusion attacks.
- **Referrer-Policy:** `strict-origin-when-cross-origin`.
- **Permissions-Policy:** Explicitly disables sensitive browser APIs (camera, microphone, geolocation).

## 4. Middleware & Access Control

- `/admin` routes default to deny with HTTP 404 responses via `src/middleware.ts` until authenticated admin authorization is integrated in Phase 3/Phase 6.
- Robots.txt disallows indexing of admin, payment, account, and transactional status URLs.
