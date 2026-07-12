import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { cartSummary, expectSummaryTotals, seedCart } from "../../support/cart-ui";

test.describe("@cross-browser representative smoke", () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.setTimeout(60_000);
  });

  test("homepage, search, and product detail render in this browser project", async ({ page }) => {
    const product = catalogFixtures.laptopProduct;

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Shop the brands you love/ })).toBeVisible();

    await page.goto(`/search?q=${encodeURIComponent(product.name)}`);
    await expect(page.getByRole("article", { name: `Product: ${product.name}` })).toBeVisible();

    await page.goto(`/product/${product.slug}`);
    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
    await expect(page.getByRole("group", { name: `Purchase actions for ${product.name}` })).toBeVisible();
  });

  test("cart business totals render in this browser project", async ({ page }) => {
    const item = cartLineFromProduct(catalogFixtures.discountedProduct, 2);

    await seedCart(page, [item]);
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: /Your Cart/ })).toBeVisible();
    await expectSummaryTotals(cartSummary(page), [item]);
  });
});
