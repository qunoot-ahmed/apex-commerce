# CI Quality Gates

GitHub Actions runs only on pushes to `master` and optional manual `workflow_dispatch`. There is no scheduled daily or monthly workflow.

## Workflow

The implemented workflow is `.github/workflows/master-quality.yml`.

It performs:

1. Checkout.
2. Node 20 setup with npm cache.
3. `npm ci`.
4. Chromium Playwright browser install.
5. `npm run lint`.
6. `npm run typecheck`.
7. `npm run build`.
8. Start the built Next.js app.
9. Poll readiness with `scripts/wait-for-url.mjs`.
10. Run `npm run test:pr`.
11. Upload Playwright reports and test evidence.

## Gate Scope

`npm run test:pr` is intentionally representative: smoke, API, integration, accessibility, SEO, and responsive specs in Chromium. Full regression, visual, and cross-browser commands remain available locally or for manual investigation.

## Permissions and Secrets

The workflow uses least-privilege `contents: read` permissions. It does not require secrets, paid services, Firebase, or scheduled infrastructure.
