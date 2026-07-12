# Product Risk Analysis

## Highest Risks

- Cart totals: subtotal, discounts, shipping threshold, tax, and final total must stay consistent between API and UI.
- Checkout validation: required customer information must block invalid simulated orders without claiming real payment coverage.
- Product discovery: search, product detail, category, and brand routes must stay crawlable and indexable.
- Accessibility regressions: navigation, forms, buttons, images, and theme controls must remain usable with assistive technologies.

## Medium Risks

- Responsive behavior: mobile navigation, search, cart, and checkout must stay usable on small viewports.
- Cross-browser rendering: core flows should work in Chromium, Firefox, WebKit, and mobile projects without running every regression everywhere.
- Visual drift: key ecommerce surfaces should be reviewed before accepting snapshot updates.

## Lower Risks

- Large crawler URL variants: representative bounded crawling is enough for CI; exhaustive crawl exploration can be run locally with a higher limit.
- Decorative content and editorial pages: covered through sitemap/crawler sampling rather than full functional suites.

## Current Non-Goals

- Real payment gateway processing.
- Login, account authentication, or user persistence.
- Live inventory or database validation.
- Third-party analytics or paid reporting service integration.
