import type { Page } from "@playwright/test";
import { expect } from "../fixtures/test";

export class ProductDetailPage {
  constructor(private readonly page: Page) {}

  async addCurrentProductToCart() {
    const productActions = this.page.locator(".add-to-cart-actions", {
      has: this.page.getByRole("button", { name: "Buy Now" }),
    });
    const addButton = productActions.getByRole("button", { name: "Add to Cart" });
    const cartResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes("/api/cart") &&
        response.request().method() === "POST"
    );

    await addButton.click();
    const response = await cartResponse;
    expect(response.ok(), `Cart API returned ${response.status()}`).toBe(true);
    await expect
      .poll(async () =>
        this.page.evaluate(() => {
          const rawCart = localStorage.getItem("apex-cart");
          return rawCart ? JSON.parse(rawCart).length : 0;
        })
      )
      .toBeGreaterThan(0);
  }

  async openCartFromHeader() {
    await this.page.getByLabel("Cart").click();
    await expect(this.page.getByRole("heading", { name: /Your Cart/ })).toBeVisible();
  }
}
