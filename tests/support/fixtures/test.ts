import { test as base, expect, type Page } from "@playwright/test";

type QualityFixtures = {
  criticalConsoleMessages: string[];
  failedCriticalResponses: string[];
};

const ignoredConsolePatterns = [
  /Download the React DevTools/i,
  /favicon/i,
];

const criticalResourceTypes = new Set([
  "document",
  "script",
  "stylesheet",
  "image",
  "font",
  "fetch",
  "xhr",
]);

export const test = base.extend<QualityFixtures>({
  page: async ({ page }, runTest) => {
    await resetBrowserState(page);
    await runTest(page);
  },

  criticalConsoleMessages: async ({ page }, runTest) => {
    const messages: string[] = [];

    page.on("console", (message) => {
      if (message.type() !== "error") return;

      const text = message.text();
      if (ignoredConsolePatterns.some((pattern) => pattern.test(text))) return;
      messages.push(text);
    });

    await runTest(messages);
  },

  failedCriticalResponses: async ({ page }, runTest) => {
    const failures: string[] = [];

    page.on("response", (response) => {
      const status = response.status();
      const request = response.request();
      if (status < 400) return;
      if (!criticalResourceTypes.has(request.resourceType())) return;
      failures.push(`${status} ${request.method()} ${response.url()}`);
    });

    await runTest(failures);
  },
});

export { expect };

async function resetBrowserState(page: Page) {
  await page.addInitScript(() => {
    if (sessionStorage.getItem("apex-test-state-reset")) return;

    localStorage.removeItem("apex-cart");
    sessionStorage.removeItem("apex-last-order");
    sessionStorage.setItem("apex-test-state-reset", "true");
  });
}
