import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

export async function expectNoAutomatedA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  const readableViolations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(", "),
      failureSummary: node.failureSummary,
    })),
  }));

  expect(
    readableViolations,
    `Axe found ${readableViolations.length} WCAG A/AA violation(s): ${JSON.stringify(
      readableViolations,
      null,
      2
    )}`
  ).toEqual([]);
}

export async function expectFocusedElementHasVisibleIndicator(page: Page) {
  const focusStyle = await page.evaluate(() => {
    const element = document.activeElement;
    if (!(element instanceof HTMLElement)) return null;

    const style = window.getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      boxShadow: style.boxShadow,
    };
  });

  expect(focusStyle, "Expected a focused HTML element").not.toBeNull();
  expect(
    focusStyle!.outlineStyle !== "none" ||
      focusStyle!.outlineWidth !== "0px" ||
      focusStyle!.boxShadow !== "none",
    `Focused element style did not expose an outline or shadow: ${JSON.stringify(focusStyle)}`
  ).toBe(true);
}
