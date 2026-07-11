import type { CartLineItem, CartTotals } from "@/types/cart";

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 9.99;

export function lineUnitPrice(item: CartLineItem): number {
  return round2(item.price * (1 - item.discountPercent / 100));
}

export function lineTotal(item: CartLineItem): number {
  return round2(lineUnitPrice(item) * item.quantity);
}

export function lineSavings(item: CartLineItem): number {
  if (item.discountPercent <= 0) return 0;
  return round2((item.price - lineUnitPrice(item)) * item.quantity);
}

export function calculateCartTotals(items: CartLineItem[]): CartTotals {
  const subtotal = round2(items.reduce((sum, item) => sum + lineTotal(item), 0));
  const savings = round2(items.reduce((sum, item) => sum + lineSavings(item), 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = items.length === 0 ? 0 : freeShippingEligible ? 0 : SHIPPING_FLAT;
  const taxable = subtotal + shipping;
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + tax);
  const amountUntilFreeShipping = freeShippingEligible
    ? 0
    : round2(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));

  return {
    itemCount,
    lineCount: items.length,
    subtotal,
    savings,
    shipping,
    tax,
    total,
    freeShippingEligible,
    amountUntilFreeShipping,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
