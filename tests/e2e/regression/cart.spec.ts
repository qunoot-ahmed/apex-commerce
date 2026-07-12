import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import {
  cartItem,
  cartSummary,
  expectCartLine,
  expectSummaryTotals,
  seedCart,
} from "../../support/cart-ui";
import { expectedCartTotals } from "../../support/assertions/business";

async function addProductFromDetail(page: import("@playwright/test").Page, slug: string) {
  await page.goto(`/product/${slug}`);
  const productName = (await page.getByRole("heading", { level: 1 }).innerText()).trim();
  const purchaseActions = page.getByRole("group", { name: `Purchase actions for ${productName}` });
  const cartResponse = page.waitForResponse(
    (response) => response.url().includes("/api/cart") && response.request().method() === "POST"
  );
  await purchaseActions.getByRole("button", { name: "Add to Cart", exact: true }).click();
  expect((await cartResponse).ok()).toBe(true);
}

async function clickAndWaitForCartCalculation(
  page: import("@playwright/test").Page,
  clickAction: () => Promise<void>
) {
  const cartResponse = page.waitForResponse(
    (response) => response.url().includes("/api/cart") && response.request().method() === "PUT"
  );
  await clickAction();
  expect((await cartResponse).ok()).toBe(true);
}

test.describe("@regression @cart cart business rules", () => {
  test.describe.configure({ mode: "serial" });

  const discounted = catalogFixtures.discountedProduct;
  const fullPrice = catalogFixtures.fullPriceProduct;

  test("empty cart shows an empty state", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue Shopping" })).toBeVisible();
  });

  test("adding one product shows unit price, line total, and summary totals", async ({ page }) => {
    const item = cartLineFromProduct(discounted);

    await addProductFromDetail(page, discounted.slug);
    await page.goto("/cart");

    await expectCartLine(page, item);
    await expectSummaryTotals(cartSummary(page), [item]);
  });

  test("adding multiple different products calculates subtotal, savings, shipping, tax, and total", async ({
    page,
  }) => {
    const discountedItem = cartLineFromProduct(discounted);
    const fullPriceItem = cartLineFromProduct(fullPrice);

    await addProductFromDetail(page, discounted.slug);
    await addProductFromDetail(page, fullPrice.slug);
    await page.goto("/cart");

    await expectCartLine(page, discountedItem);
    await expectCartLine(page, fullPriceItem);
    await expectSummaryTotals(cartSummary(page), [discountedItem, fullPriceItem]);
  });

  test("adding the same product twice merges it into one cart line", async ({ page }) => {
    const item = cartLineFromProduct(discounted, 2);

    await addProductFromDetail(page, discounted.slug);
    await addProductFromDetail(page, discounted.slug);
    await page.goto("/cart");

    await expect(cartItem(page, item)).toHaveCount(1);
    await expectCartLine(page, item);
    await expectSummaryTotals(cartSummary(page), [item]);
  });

  test("quantity can increase and decrease without losing formula accuracy", async ({ page }) => {
    const originalItem = cartLineFromProduct(discounted, 2);
    const increasedItem = cartLineFromProduct(discounted, 3);
    const decreasedItem = cartLineFromProduct(discounted, 2);

    await seedCart(page, [originalItem]);
    await page.goto("/cart");

    await clickAndWaitForCartCalculation(page, () =>
      cartItem(page, originalItem)
        .getByRole("button", { name: `Increase quantity for ${discounted.name}` })
        .click()
    );
    await expectCartLine(page, increasedItem);
    await expectSummaryTotals(cartSummary(page), [increasedItem]);

    await clickAndWaitForCartCalculation(page, () =>
      cartItem(page, originalItem)
        .getByRole("button", { name: `Decrease quantity for ${discounted.name}` })
        .click()
    );
    await expectCartLine(page, decreasedItem);
    await expectSummaryTotals(cartSummary(page), [decreasedItem]);
  });

  test("remove and lower-boundary quantity actions clear a line item", async ({ page }) => {
    const item = cartLineFromProduct(discounted);

    await seedCart(page, [item]);
    await page.goto("/cart");
    await cartItem(page, item).getByRole("button", { name: `Decrease quantity for ${discounted.name}` }).click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();

    await seedCart(page, [item]);
    await page.goto("/cart");
    await cartItem(page, item).getByRole("button", { name: `Remove ${discounted.name}` }).click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("upper quantity boundary disables increasing beyond stock", async ({ page }) => {
    const item = cartLineFromProduct(discounted, discounted.stock);

    await seedCart(page, [item]);
    await page.goto("/cart");

    await expect(
      cartItem(page, item).getByRole("textbox", {
        name: `Quantity for ${discounted.name}`,
        exact: true,
      })
    ).toHaveValue(String(discounted.stock));
    await expect(
      cartItem(page, item).getByRole("button", { name: `Increase quantity for ${discounted.name}` })
    ).toBeDisabled();
    await expectSummaryTotals(cartSummary(page), [item]);
  });

  test("cart persists after navigation and refresh", async ({ page }) => {
    const item = cartLineFromProduct(fullPrice);

    await addProductFromDetail(page, fullPrice.slug);
    await page.goto("/cart");
    await expectCartLine(page, item);

    await page.reload();
    await expectCartLine(page, item);

    await page.getByRole("link", { name: "Continue Shopping" }).click();
    await page.goto("/cart");
    await expectCartLine(page, item);
  });

  test("displayed totals match the documented business formulas", async ({ page }) => {
    const items = [cartLineFromProduct(discounted, 2), cartLineFromProduct(fullPrice, 1)];
    const expected = expectedCartTotals(items);

    await seedCart(page, items);
    await page.goto("/cart");

    await expectSummaryTotals(cartSummary(page), items);
    expect(expected.tax).toBeCloseTo((expected.subtotal + expected.shipping) * 0.08, 2);
    expect(expected.total).toBeCloseTo(expected.subtotal + expected.shipping + expected.tax, 2);
  });
});
