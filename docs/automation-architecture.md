# Automation Architecture

The framework is Playwright Test with TypeScript. It keeps support code small and discoverable for QA engineers learning the project.

## Structure

- `playwright.config.ts`: projects, reporters, web server, retries, and shared runtime settings.
- `tests/support/fixtures/test.ts`: browser state cleanup and critical console/network diagnostics.
- `tests/support/pages`: page objects for repeated customer actions.
- `tests/support/assertions`: business, image, diagnostics, and accessibility assertions.
- `tests/support/clients`: typed API clients for implemented cart and checkout endpoints.
- `tests/support/cart-ui.ts`: cart seeding and summary assertions for localStorage-backed UI state.
- `tests/e2e`: smoke, regression, API, integration, accessibility, visual, SEO, responsive, and cross-browser specs.

## Locator Strategy

Tests should use role, label, placeholder, text, and accessible-name locators first. Use CSS selectors only for stable structural checks where no accessible locator is appropriate, such as product card articles or metadata tags.

## Data Strategy

Catalog data is generated/static and imported through deterministic fixtures. Tests avoid random product selection so failures are reproducible.

## Reporting

Playwright writes:

- HTML report: `playwright-report/`
- JUnit report: `test-results/junit.xml`
- failure evidence: traces, screenshots, and videos under `test-results/`
