# DEPLOYMENT.md — Deployment & Infrastructure Guide

## 1. Hosting Architecture

The storefront is deployed to **Vercel** utilizing Next.js App Router serverless infrastructure.

## 2. Environment Variables Configuration

Set the following variables in the Vercel Project Dashboard (Settings → Environment Variables):

| Variable | Environment | Required | Description |
|---|---|---|---|
| `NODE_ENV` | Production, Preview | Yes | Set to `production` |
| `APP_ENV` | Production, Preview | Yes | Set to `production` (or `staging`) |
| `NEXT_PUBLIC_APP_URL` | Production, Preview | Yes | Canonical production domain URL |
| `NEXT_PUBLIC_BRAND_NAME` | Production, Preview | Yes | Storefront brand name (`VAP Handicrafts`) |
| `CRON_SECRET` | Production, Preview | Yes (P5+) | High-entropy token guarding scheduled jobs |

*Note: Supabase, Paytm, and Resend credentials will be added during their respective implementation phases (Phases 3, 5, and 6).*

## 3. Pre-Deployment Verification

Before any production or preview merge, all automated checks must succeed:

```bash
npm run typecheck
npm run test
npm run check:secrets
npm run build
```

## 4. Preview Deployments

Every GitHub pull request automatically provisions an isolated Vercel preview deployment with production-like headers and route protections enabled.
