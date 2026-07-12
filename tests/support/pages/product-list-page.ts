import type { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class ProductListPage {
  constructor(private readonly page: Page) {}

  firstProductCard(): Locator {
    return this.page.getByRole("article", { name: /^Product:/ }).first();
  }

  async openFirstProduct(): Promise<string> {
    const firstCard = this.firstProductCard();
    const productName = (await firstCard.getByRole("heading").innerText()).trim();
    await firstCard.getByRole("link", { name: `View details for ${productName}` }).click();
    await expect(this.page.getByRole("heading", { name: productName })).toBeVisible();
    return productName;
  }
}
