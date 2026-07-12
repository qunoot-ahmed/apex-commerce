# Known Limitations

- Checkout is simulated. Tests validate app behavior and API responses, not real payment-provider processing.
- Cart state is browser localStorage-backed. API-created state cannot directly hydrate the UI without seeding localStorage in tests.
- Catalog data is generated/static mock data. Tests do not validate a live database or inventory service.
- Automated Axe checks do not prove full WCAG compliance. Manual assistive technology review is still needed for release certification.
- Visual snapshots are Chromium-only to keep maintenance cost reasonable.
- Cross-browser coverage is representative smoke, not the full regression suite in every browser.
- The bounded crawler samples internal routes with a route limit to prevent uncontrolled query and URL explosion.
- CI runs only on `master` push or manual dispatch by user decision. No scheduled regression workflow exists.
- Deployment positioning is Vercel-only. Firebase configs, scripts, and docs are intentionally absent.
