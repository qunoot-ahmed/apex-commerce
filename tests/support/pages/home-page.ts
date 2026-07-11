import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/");
    await expect(
      this.page.getByRole("heading", {
        name: /Shop the brands you love\. Discover what's next\./,
      })
    ).toBeVisible();
  }

  async search(query: string) {
    const searchRegion = this.page.getByRole("search").first();
    await searchRegion.getByLabel("Search").fill(query);
    await searchRegion.getByRole("button", { name: "Search" }).click();
  }

  async openProductsFromPrimaryNavigation() {
    await this.page.getByRole("navigation", { name: "Main" }).getByRole("link", {
      name: "Products",
    }).click();
  }
}
