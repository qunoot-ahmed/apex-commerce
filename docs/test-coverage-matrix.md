# Test Coverage Matrix

| Area | Suite | Command | Browser Scope |
| --- | --- | --- | --- |
| Smoke journey | `tests/e2e/smoke` | `npm run test:smoke` | Chromium |
| UI regression | `tests/e2e/regression` | `npm run test:regression` | Chromium |
| Cart and checkout API | `tests/e2e/api` | `npm run test:api` | Chromium request context |
| UI/API integration | `tests/e2e/integration` | `npm run test:integration` | Chromium |
| Accessibility | `tests/e2e/a11y` | `npm run test:a11y` | Chromium |
| Visual snapshots | `tests/e2e/visual` | `npm run test:visual` | Chromium |
| SEO and crawler | `tests/e2e/seo` | `npm run test:seo` | Chromium/request |
| Responsive | `tests/e2e/responsive` | `npm run test:responsive` | Mobile Chrome project |
| Cross-browser smoke | `tests/e2e/cross-browser` | `npm run test:cross-browser` | Chromium, Firefox, WebKit, mobile Chrome, mobile Safari |
| Master quality gate | Representative suites | `npm run test:pr` | Chromium |

## Notes

- API tests cover real implemented endpoints only: `/api/cart` and `/api/checkout`.
- The integration test documents the localStorage limitation by validating API cart state and then seeding the UI storage with that validated state.
- Visual tests use native Playwright screenshots. Baselines should be reviewed before updating.
- Axe scans are automated checks and do not prove complete WCAG compliance.
