# TESTING.md — Testing Strategy & Quality Assurance

This document details the test suites, tools, and quality gates enforced in the repository.

---

## 1. Test Harness Overview

| Test Type | Framework | Location | Purpose |
|---|---|---|---|
| **Unit Tests** | Vitest | `src/**/*.test.ts` | Currency math (paise), token contrast calculations, env validation |
| **Accessibility Tests** | Playwright + Axe-Core | `tests/e2e/a11y.spec.ts` | WCAG 2.2 AA automated audits (0 serious/critical violations) |
| **Responsive Tests** | Playwright | `tests/e2e/responsive.spec.ts` | Zero horizontal overflow across 360, 390, 768, 1024, 1440px |
| **Smoke / E2E Tests** | Playwright | `tests/e2e/smoke.spec.ts` | Route resolution, skip links, mobile drawer, middleware denial |
| **Security Scanning** | Node.js script | `scripts/check-secrets.mjs` | Automated regex check against credential leaks |

---

## 2. Running Test Suites

```bash
# Run unit & integration tests
npm run test

# Run accessibility checks
npm run test:a11y

# Run full end-to-end tests
npm run test:e2e

# Run secret scanning
npm run check:secrets
```

---

## 3. Quality Gate Policies

- **Strict Typechecking:** `tsc --noEmit` must pass with zero errors under `strict: true` and `noUncheckedIndexedAccess: true`.
- **Honest Test Reporting:** Tests are never commented out or weakened to achieve green status.
- **Continuous Integration:** Every commit pushed to GitHub triggers the complete verification pipeline before deployment.
