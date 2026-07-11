import { expect, type Page } from "@playwright/test";

export async function expectVisibleImagesLoaded(page: Page) {
  await expect
    .poll(async () => {
      return page.locator("img:visible").evaluateAll((images) =>
        images.every((image) => {
          const img = image as HTMLImageElement;
          return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        })
      );
    }, {
      message: "Visible images should finish loading successfully",
      timeout: 10_000,
    })
    .toBe(true);
}
