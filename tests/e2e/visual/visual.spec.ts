import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { seedCart } from "../../support/cart-ui";
import { stabilizeForScreenshot } from "../../support/visual";

test.describe("@visual Chromium visual regression", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("homepage light theme", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Shop the brands you love/ })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("homepage-light.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      timeout: 15_000,
    });
  });

  test("homepage dark theme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("homepage-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("product listing surface", async ({ page }) => {
    await page.goto(`/products?brand=${catalogFixtures.discountedProduct.brandSlug}`);
    await expect(page.getByRole("article", { name: `Product: ${catalogFixtures.discountedProduct.name}` })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("product-listing.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("product detail", async ({ page }) => {
    await page.goto(`/product/${catalogFixtures.discountedProduct.slug}`);
    await expect(page.getByRole("heading", { name: catalogFixtures.discountedProduct.name })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("product-detail.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("search results", async ({ page }) => {
    await page.goto("/search?q=laptop");
    await expect(page.getByRole("heading", { name: 'Results for "laptop"' })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("search-results.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("empty cart", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("empty-cart.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("populated cart", async ({ page }) => {
    await seedCart(page, [cartLineFromProduct(catalogFixtures.discountedProduct, 2)]);
    await page.goto("/cart");
    await expect(page.getByRole("region", { name: "Cart order summary" })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("populated-cart.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("checkout", async ({ page }) => {
    await seedCart(page, [cartLineFromProduct(catalogFixtures.fullPriceProduct)]);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("checkout.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("mobile homepage navigation", async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.locator("header .d-lg-none").getByRole("link", { name: "Crawler Test" })
    ).toBeVisible();
    await stabilizeForScreenshot(page);
    await expect(page).toHaveScreenshot("mobile-homepage-navigation.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
