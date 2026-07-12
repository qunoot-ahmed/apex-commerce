import type { Page } from "@playwright/test";

export async function stabilizeForScreenshot(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
      .apex-animate-in {
        opacity: 1 !important;
        transform: none !important;
      }
    `,
  });

  await page.evaluate(async () => {
    await document.fonts?.ready;
    const waitForImage = (image: HTMLImageElement) =>
      image.complete
        ? Promise.resolve()
        : Promise.race([
            new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            }),
            new Promise<void>((resolve) => window.setTimeout(resolve, 2_000)),
          ]);

    await Promise.all(Array.from(document.images).map(waitForImage));
  });

  await page.waitForTimeout(300);
}
