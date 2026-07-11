import { getCatalog } from "@/lib/data/catalog";
import { calculateCartTotals, lineUnitPrice } from "@/lib/cart/calculations";
import type { CartLineItem, CartState } from "@/types/cart";
import type { Product } from "@/types/catalog";

export function productToCartLine(product: Product, quantity: number): CartLineItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image.src,
    imageAlt: product.image.alt,
    sku: product.sku,
    price: product.price,
    discountPercent: product.discountPercent,
    quantity,
    stock: product.stock,
  };
}

export function getProductById(productId: string): Product | null {
  return getCatalog().products.find((p) => p.id === productId) ?? null;
}

export function validateCartItems(
  rawItems: { productId: string; quantity: number }[]
): { items: CartLineItem[]; errors: string[] } {
  const errors: string[] = [];
  const items: CartLineItem[] = [];

  for (const raw of rawItems) {
    if (!raw.productId || raw.quantity < 1) {
      errors.push("Invalid cart line item.");
      continue;
    }
    const product = getProductById(raw.productId);
    if (!product) {
      errors.push(`Product ${raw.productId} not found.`);
      continue;
    }
    if (product.stock <= 0) {
      errors.push(`${product.name} is out of stock.`);
      continue;
    }
    const qty = Math.min(raw.quantity, product.stock);
    if (qty < raw.quantity) {
      errors.push(`Only ${qty} of ${product.name} available.`);
    }
    items.push(productToCartLine(product, qty));
  }

  return { items, errors };
}

export function buildCartState(items: CartLineItem[]): CartState {
  return {
    items,
    totals: calculateCartTotals(items),
    updatedAt: new Date().toISOString(),
  };
}

export function mergeCartItem(
  existing: CartLineItem[],
  product: Product,
  quantity: number
): CartLineItem[] {
  const next = [...existing];
  const idx = next.findIndex((i) => i.productId === product.id);
  const newQty = Math.min(
    (idx >= 0 ? next[idx]!.quantity : 0) + quantity,
    product.stock
  );

  if (newQty <= 0) return next.filter((i) => i.productId !== product.id);

  const line = productToCartLine(product, newQty);
  if (idx >= 0) next[idx] = line;
  else next.push(line);
  return next;
}

export function updateItemQuantity(
  items: CartLineItem[],
  productId: string,
  quantity: number
): CartLineItem[] {
  const product = getProductById(productId);
  if (!product) return items.filter((i) => i.productId !== productId);
  if (quantity <= 0) return items.filter((i) => i.productId !== productId);
  return items.map((i) =>
    i.productId === productId
      ? { ...i, quantity: Math.min(quantity, product.stock) }
      : i
  );
}

export function formatCartSummary(items: CartLineItem[]) {
  return items.map((item) => ({
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: lineUnitPrice(item),
    lineTotal: lineUnitPrice(item) * item.quantity,
  }));
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `APEX-${ts}-${rand}`;
}
