# Apex Commerce

Production-grade Next.js ecommerce platform built for large-scale URL discovery, SEO crawling, analytics testing, and performance benchmarking.

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
