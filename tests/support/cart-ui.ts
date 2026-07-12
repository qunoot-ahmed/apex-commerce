import type { Locator, Page } from "@playwright/test";
import { expect } from "./fixtures/test";
import type { CartLineItem } from "../../src/types/cart";
import {
  expectedCartTotals,
  expectedLineTotal,
  effectiveUnitPrice,
  expectCurrency,
  formatCurrency,
} from "./assertions/business";

export async function seedCart(page: Page, items: CartLineItem[]) {
  await page.addInitScript((cartItems) => {
    sessionStorage.setItem("apex-test-state-reset", "true");
    localStorage.setItem("apex-cart", JSON.stringify(cartItems));
  }, items);
}

export function cartItem(page: Page, item: Pick<CartLineItem, "name">): Locator {
  return page.getByRole("group", { name: `Cart item: ${item.name}` });
}

export function cartSummary(page: Page): Locator {
  return page.getByRole("region", { name: "Cart order summary" });
}

export function checkoutSummary(page: Page): Locator {
  return page.getByRole("region", { name: "Checkout order summary" });
}

export async function expectCartLine(page: Page, item: CartLineItem) {
  const line = cartItem(page, item);

  await expect(line.getByRole("link", { name: item.name, exact: true })).toBeVisible();
  await expect(
    line.getByRole("textbox", { name: `Quantity for ${item.name}`, exact: true })
  ).toHaveValue(String(item.quantity));
  await expect(line).toContainText(formatCurrency(effectiveUnitPrice(item)));
  await expect(line).toContainText(formatCurrency(expectedLineTotal(item)));
}

export async function expectSummaryTotals(summary: Locator, items: CartLineItem[]) {
  const totals = expectedCartTotals(items);

  await expectCurrency(summary.getByText("Subtotal", { exact: true }).locator("xpath=.."), totals.subtotal);
  await expectCurrency(summary.getByText("Shipping", { exact: true }).locator("xpath=.."), totals.shipping);
  await expectCurrency(summary.getByText("Tax (8%)", { exact: true }).locator("xpath=.."), totals.tax);
  await expectCurrency(summary.getByText("Total", { exact: true }).locator("xpath=.."), totals.total);

  if (totals.savings > 0) {
    await expectCurrency(summary.getByText("Savings", { exact: true }).locator("xpath=.."), -totals.savings);
  } else {
    await expect(summary.getByText("Savings", { exact: true })).toHaveCount(0);
  }
}
