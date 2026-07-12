# Visual Regression

Visual checks use Playwright's native `toHaveScreenshot` assertions in Chromium only.

## Commands

```bash
npm run test:visual
npm run test:visual:update
```

## Baseline Process

1. Run `npm run test:visual`.
2. If intentional UI changes cause failures, inspect the generated diffs in `test-results/`.
3. Run `npm run test:visual:update` only after reviewing the visual change.
4. Commit the updated `*-snapshots` baseline files with the related UI or test change.

## Stability Controls

The suite disables animations, waits for fonts and images, and uses controlled viewports. Masking is avoided unless a genuinely dynamic element is introduced.
