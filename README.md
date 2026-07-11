# Apex Commerce

Production-grade Next.js ecommerce platform built for large-scale URL discovery, SEO crawling, analytics testing, and performance benchmarking.

This repository is also being developed as a Quality Engineering portfolio project for senior QA, test automation, and test consulting roles. The automation strategy is intentionally risk-based: it starts with deployment-critical smoke coverage and grows into catalog, search, cart, checkout, API, accessibility, visual, SEO, responsive, and CI quality gates.

## Live Website

[https://apex-website-three-bice.vercel.app](https://apex-website-three-bice.vercel.app)

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Bootstrap 5 + React Bootstrap patterns
- MUI 6 (theme, ratings, skeletons)
- SEO: Metadata API, JSON-LD, sitemap.xml, robots.txt

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Engineering Stack

- Playwright Test with TypeScript for UI, API, responsive, visual, SEO, and integration testing
- `@axe-core/playwright` for automated accessibility checks
- Playwright HTML, list, and JUnit reporters
- GitHub Actions planned for pull-request and scheduled regression quality gates

## Test Commands

Install Playwright browsers once per machine:

```bash
npx playwright install
```

Run the current Phase 1 smoke suite:

```bash
npm run test:smoke
```

Useful local commands:

```bash
npm run test
npm run test:e2e
npm run test:headed
npm run test:debug
npm run test:report
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Playwright reports are written to `playwright-report/`; JUnit output is written to `test-results/junit.xml`.

## Crawler entry point

Start discovery at **`/crawler-test`** — exposes 1000+ internal links (products, categories, brands, filters, pagination, UTM variants, deep store paths).

## Catalog scale

| Entity      | Count |
|------------|-------|
| Products   | 520+  |
| Brands     | 55    |
| Categories | 30+ (nested paths) |
| Collections| 24    |
| Blog posts | 110   |

## Key routes

- `/products` — listing with query filters (`?category=&brand=&sort=&page=`)
- `/product/[slug]` — product detail + UTM query variants
- `/category/[...slug]` — nested categories
- `/brand/[slug]`, `/collection/[slug]`, `/blog/[slug]`
- `/search?q=` — search results
- `/store/[...path]` — deep nested store URLs
- `/sitemap` — HTML sitemap
- `/sitemap.xml` — XML sitemap
- `/robots.txt`

## Environment

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` for production canonical URLs.

Playwright uses `BASE_URL` when targeting a deployed or already-running environment:

```env
BASE_URL=http://localhost:3000
```

## Images

Product images use an explicit local image manifest with downloaded product assets mapped by product archetype and category. See `src/lib/images/product-image-manifest.json` and `src/lib/images/catalog-images.ts`.

## Vercel Deployment

This project is deployed on Vercel. To deploy from a local authenticated Vercel CLI session:

```bash
npm install
npm run build
npx vercel --prod
```

For production SEO/canonical URLs, set:

```env
NEXT_PUBLIC_SITE_URL=https://apex-website-three-bice.vercel.app
```

## Tracking Scripts

No third-party tracking scripts are loaded by default.

## Current Testing Status

Phase 1 adds the Playwright foundation and smoke coverage for homepage availability, primary navigation, search, product opening, add-to-cart, cart summary visibility, critical image loading, and critical browser/network error detection.

Broader API, accessibility, visual, SEO, responsive, and CI workflow coverage will be added in later approved phases.

## AI-Assisted Development Disclosure

This project was developed using AI-assisted engineering with Cursor. Product requirements, quality strategy, risk analysis, architectural decisions, test design, implementation review, and validation were directed and owned by the project author.
