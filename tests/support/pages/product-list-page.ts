import type { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class ProductListPage {
  constructor(private readonly page: Page) {}

  firstProductCard(): Locator {
    return this.page.locator("article.product-card").first();
  }

  async openFirstProduct(): Promise<string> {
    const firstCard = this.firstProductCard();
    const productName = (await firstCard.getByRole("heading").innerText()).trim();
    await firstCard.getByRole("link").first().click();
    await expect(this.page.getByRole("heading", { name: productName })).toBeVisible();
    return productName;
  }
}
