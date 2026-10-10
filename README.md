# VAP Handicrafts — Premium 3D Ecommerce Storefront

A luxury ecommerce experience for handcrafted shell jewellery, personalized keepsake cards, and heartfelt gift sets across India (INR / UPI via Paytm).

## Architecture & Guiding Philosophy

- **Authoritative Backend:** The browser stores only user intent; all pricing, inventory verification, discounts, and payment confirmation are calculated exclusively on the server in integer minor units (paise).
- **Accessible-First Luxury:** Built to WCAG 2.2 AA standards with verified focus indicators, full keyboard operability, zero layout shifts, and responsive layouts across all mobile, tablet, and desktop viewports.
- **Honest Commerce:** Zero fabricated sales counts, reviews, fake urgency, or stock claims. Transparent pricing and genuine handmade craftsmanship.

## Tech Stack

- **Framework:** Next.js (App Router), React 19, TypeScript (`strict: true`, `noUncheckedIndexedAccess`)
- **Styling & Tokens:** Tailwind CSS with CSS variable tokens defined in `DESIGN.md` (accessible AA variants)
- **UI Primitives:** Radix UI accessible primitives wrapped in `src/components/ui`
- **Typography:** Self-hosted `next/font` (Cormorant Garamond display + Inter body)
- **Validation:** Zod schemas enforcing strict client/server environment boundaries
- **Testing:** Vitest (unit/integration), Playwright (E2E), Axe Core (automated accessibility)

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the storefront.

### 3. Verification Commands

```bash
# Typecheck
npm run typecheck

# Unit tests (Paise arithmetic, token contrast, env validation)
npm run test

# Secret scanning
npm run check:secrets

# Production build
npm run build

# End-to-end tests (Playwright)
npm run test:e2e
```

## Project Documentation

Detailed architecture specifications and rules are located in `/docs`:
- [PRD.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/PRD.md) — Product Requirements & Source of Truth
- [AGENTS.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/AGENTS.md) — Multi-Agent Operating Manual
- [RULES.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/RULES.md) — Non-Negotiable Project Constraints
- [ARCHITECTURE.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/ARCHITECTURE.md) — Technical Architecture & Boundaries
- [DESIGN.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/DESIGN.md) — Visual Design System & Token Specifications
- [DECISIONS.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/DECISIONS.md) — Architecture Decision Records (ADRs) & Owner Decisions
- [PLAN.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/PLAN.md) — Phase Roadmap & Acceptance Criteria
- [SECURITY.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/SECURITY.md) — Security Baseline & Threat Mitigations
- [DEPLOYMENT.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/DEPLOYMENT.md) — Vercel & CI/CD Deployment Guide
- [TESTING.md](file:///c:/Users/Vivan/OneDrive/Documents/FREELANCE/VAP%20Handicrafts/docs/TESTING.md) — Testing Strategy & Quality Gates
