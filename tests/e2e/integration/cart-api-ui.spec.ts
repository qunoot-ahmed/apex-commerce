import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures } from "../../support/catalog-fixtures";
import { cartSummary, expectSummaryTotals, seedCart } from "../../support/cart-ui";
import { CartApiClient, parseCartState } from "../../support/clients/cart-api";

test.describe("@integration API-calculated cart state in the UI", () => {
  test("cart UI totals match API-validated business data seeded into localStorage", async ({
    page,
    request,
  }) => {
    const api = new CartApiClient(request);
    const product = catalogFixtures.discountedProduct;
    const response = await api.replace([
      { productId: product.id, quantity: 2 },
      { productId: catalogFixtures.fullPriceProduct.id, quantity: 1 },
    ]);
    const state = await parseCartState(response);

    expect(response.status()).toBe(200);
    expect(state.warnings ?? []).toEqual([]);

    // The app cart is intentionally localStorage-backed, so API-created state
    // cannot directly hydrate the browser cart without seeding localStorage.
    await seedCart(page, state.items);
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: `Your Cart (${state.totals.itemCount} items)` })).toBeVisible();
    await expectSummaryTotals(cartSummary(page), state.items);
  });
});
