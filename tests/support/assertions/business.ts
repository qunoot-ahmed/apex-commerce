import type { Locator } from "@playwright/test";
import { expect } from "../fixtures/test";
import type { CartLineItem, CartTotals } from "../../../src/types/cart";

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 9.99;

export function effectiveUnitPrice(item: Pick<CartLineItem, "price" | "discountPercent">): number {
  return round2(item.price * (1 - item.discountPercent / 100));
}

export function expectedLineTotal(item: Pick<CartLineItem, "price" | "discountPercent" | "quantity">): number {
  return round2(effectiveUnitPrice(item) * item.quantity);
}

export function expectedLineSavings(item: Pick<CartLineItem, "price" | "discountPercent" | "quantity">): number {
  if (item.discountPercent <= 0) return 0;
  return round2((item.price - effectiveUnitPrice(item)) * item.quantity);
}

export function expectedCartTotals(items: CartLineItem[]): CartTotals {
  const subtotal = round2(items.reduce((sum, item) => sum + expectedLineTotal(item), 0));
  const savings = round2(items.reduce((sum, item) => sum + expectedLineSavings(item), 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length === 0 ? 0 : freeShippingEligible ? 0 : SHIPPING_FLAT;
  const taxable = subtotal + shipping;
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + tax);

  return {
    itemCount,
    lineCount: items.length,
    subtotal,
    savings,
    shipping,
    tax,
    total,
    freeShippingEligible,
    amountUntilFreeShipping: freeShippingEligible
      ? 0
      : round2(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)),
  };
}

export async function expectCurrency(locator: Locator, expected: number) {
  if (expected === 0) {
    await expect(locator).toContainText(/FREE|\$0\.00/i);
    expect(parseCurrency(await locator.textContent())).toBe(0);
    return;
  }

  await expect(locator).toContainText(formatCurrency(expected));
  expect(parseCurrency(await locator.textContent())).toBeCloseTo(expected, 2);
}

export function parseCurrency(text: string | null): number {
  const normalized = (text ?? "").trim();
  if (/free/i.test(normalized)) return 0;

  const matches = normalized.match(/-?\$[\d,]+(?:\.\d{2})?/g);
  const currency = matches?.at(-1);
  if (!currency) {
    throw new Error(`Could not parse currency from "${normalized}"`);
  }

  const isNegative = currency.startsWith("-");
  const numeric = Number(currency.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) {
    throw new Error(`Could not parse currency from "${normalized}"`);
  }
  return isNegative ? -numeric : numeric;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function round2(amount: number): number {
  return Math.round(amount * 100) / 100;
}
