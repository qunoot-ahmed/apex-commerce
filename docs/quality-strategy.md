# Quality Strategy

Apex Commerce uses risk-based Playwright coverage around the highest-value ecommerce paths: catalog discovery, search, cart math, simulated checkout, SEO discoverability, accessibility, and responsive behavior.

## Principles

- Prefer user-visible locators: roles, labels, placeholders, accessible names, and headings.
- Keep tests deterministic by using generated static catalog fixtures and isolated browser storage.
- Validate business formulas once in shared helpers, then assert the UI and API agree with those formulas.
- Run deep browser coverage only where it adds confidence. Full regression stays Chromium-focused; cross-browser smoke is representative.
- Treat checkout as simulated. These tests do not claim real payment, auth, inventory, or database coverage.

## Implemented Quality Layers

- Smoke: deployment-critical homepage, navigation, search, product, cart, and diagnostics.
- Regression: catalog, search, cart, and checkout UI behavior.
- API: `/api/cart` and `/api/checkout` success and validation behavior.
- Integration: API-calculated cart data seeded into localStorage and verified in the UI.
- Accessibility: Axe WCAG A/AA scans plus keyboard, form label, image alt, and accessible-name checks.
- Visual: Chromium-only snapshots with animation disabling and stable viewport coverage.
- SEO: metadata, robots, sitemaps, product JSON-LD, breadcrumbs, invalid route behavior, and bounded crawling.
- Responsive and cross-browser: mobile-specific flows plus representative smoke across configured projects.
