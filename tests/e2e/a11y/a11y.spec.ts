import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { seedCart } from "../../support/cart-ui";
import {
  expectFocusedElementHasVisibleIndicator,
  expectNoAutomatedA11yViolations,
} from "../../support/assertions/a11y";

test.describe("@a11y automated WCAG A/AA checks", () => {
  test("homepage has no automated accessibility violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Shop the brands you love/ })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("product listing has no automated accessibility violations", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("search results have no automated accessibility violations", async ({ page }) => {
    await page.goto("/search?q=laptop");
    await expect(page.getByRole("heading", { name: 'Results for "laptop"' })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("product detail has no automated accessibility violations", async ({ page }) => {
    await page.goto(`/product/${catalogFixtures.discountedProduct.slug}`);
    await expect(page.getByRole("heading", { name: catalogFixtures.discountedProduct.name })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("empty cart has no automated accessibility violations", async ({ page }) => {
    await page.goto("/cart");
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("populated cart has no automated accessibility violations", async ({ page }) => {
    await seedCart(page, [cartLineFromProduct(catalogFixtures.discountedProduct, 2)]);
    await page.goto("/cart");
    await expect(page.getByRole("region", { name: "Cart order summary" })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });

  test("checkout has no automated accessibility violations", async ({ page }) => {
    await seedCart(page, [cartLineFromProduct(catalogFixtures.fullPriceProduct)]);
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expectNoAutomatedA11yViolations(page);
  });
});

test.describe("@a11y focused accessibility checks", () => {
  test("main navigation is keyboard reachable and focus is visible", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    await expect
      .poll(() => page.evaluate(() => document.activeElement?.textContent?.trim() ?? ""))
      .not.toBe("");
    await expectFocusedElementHasVisibleIndicator(page);

    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Products" }).focus();
    await expectFocusedElementHasVisibleIndicator(page);
  });

  test("mobile navigation opens from the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.focus();
    await page.keyboard.press("Enter");

    await expect(
      page.locator("header .d-lg-none").getByRole("link", { name: "Crawler Test" })
    ).toBeVisible();
  });

  test("checkout fields and payment options expose accessible names", async ({ page }) => {
    await seedCart(page, [cartLineFromProduct(catalogFixtures.discountedProduct)]);
    await page.goto("/checkout");

    for (const label of [
      "First name",
      "Last name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "ZIP",
    ]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("radio", { name: "Credit / Debit Card" })).toBeChecked();
    await expect(page.getByRole("radio", { name: "PayPal" })).toBeVisible();
  });

  test("homepage heading hierarchy does not skip levels", async ({ page }) => {
    await page.goto("/");

    const headingLevels = await page
      .locator("main h1, main h2, main h3, main h4, main h5, main h6")
      .evaluateAll((headings) =>
        headings.map((heading) => Number(heading.tagName.replace("H", "")))
      );

    expect(headingLevels.length).toBeGreaterThan(0);
    expect(headingLevels[0]).toBe(1);
    for (let index = 1; index < headingLevels.length; index += 1) {
      expect(headingLevels[index]! - headingLevels[index - 1]!).toBeLessThanOrEqual(1);
    }
  });

  test("theme toggle and product imagery have meaningful accessible names", async ({ page }) => {
    await page.goto(`/product/${catalogFixtures.laptopProduct.slug}`);

    await expect(page.getByRole("button", { name: "Toggle theme" })).toBeVisible();
    await expect(page.getByRole("img", { name: catalogFixtures.laptopProduct.image.alt }).first()).toBeVisible();

    const emptyAltImages = await page.locator("main img").evaluateAll((images) =>
      images
        .map((image) => image.getAttribute("alt"))
        .filter((alt) => alt === null || alt.trim() === "")
    );
    expect(emptyAltImages).toEqual([]);
  });
});
