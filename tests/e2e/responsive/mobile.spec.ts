import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { checkoutSummary, expectSummaryTotals, seedCart } from "../../support/cart-ui";

test.describe("@responsive mobile commerce flows", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile menu opens, exposes categories, and navigates to crawler hub", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileMenu = page.locator("header .d-lg-none");
    await expect(mobileMenu.getByRole("link", { name: "Crawler Test" })).toBeVisible();
    await mobileMenu.getByRole("link", { name: "Crawler Test" }).click();

    await expect(page).toHaveURL(/\/crawler-test$/);
    await expect(page.getByRole("heading", { name: "Crawler Test Hub" })).toBeVisible();
  });

  test("mobile search reaches product results and detail", async ({ page }) => {
    const product = catalogFixtures.laptopProduct;

    await page.goto("/");
    const mobileSearch = page.locator("header").getByRole("search").last();
    await mobileSearch.getByLabel("Search").fill("laptop");
    await mobileSearch.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/\/search\?q=laptop/);
    await page
      .getByRole("article", { name: `Product: ${product.name}` })
      .getByRole("link", { name: `View details for ${product.name}` })
      .click();

    await expect(page).toHaveURL(new RegExp(`/product/${product.slug}$`));
    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  });

  test("mobile cart and checkout summaries stay usable", async ({ page }) => {
    const item = cartLineFromProduct(catalogFixtures.discountedProduct, 2);

    await seedCart(page, [item]);
    await page.goto("/cart");
    await expect(page.getByRole("region", { name: "Cart order summary" })).toBeVisible();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("button", { name: /Place Order/ })).toBeVisible();
    await expectSummaryTotals(checkoutSummary(page), [item]);
  });
});
