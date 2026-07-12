import { getCatalog } from "../../src/lib/data/catalog";
import type { CartLineItem } from "../../src/types/cart";
import type { Product } from "../../src/types/catalog";

const catalog = getCatalog();

function requireProduct(description: string, predicate: (product: Product) => boolean): Product {
  const product = catalog.products.find(predicate);
  if (!product) {
    throw new Error(`Missing deterministic catalog fixture: ${description}`);
  }
  return product;
}

export const catalogFixtures = {
  discountedProduct: requireProduct("discounted product", (product) => product.discountPercent > 0),
  fullPriceProduct: requireProduct("full price product", (product) => product.discountPercent === 0),
  laptopProduct: requireProduct("laptop product", (product) =>
    product.categoryPath.join("/") === "electronics/computers/laptops"
  ),
  secondCartProduct: requireProduct(
    "different product for cart",
    (product) => product.id !== catalog.products[0]?.id && product.stock > 2
  ),
  noResultsTerm: "zzzz-no-apex-product",
};

export function productsForBrand(brandSlug: string): Product[] {
  return catalog.products.filter((product) => product.brandSlug === brandSlug);
}

export function productsForCategory(categoryPath: string): Product[] {
  return catalog.products.filter((product) => product.categoryPath.join("/").includes(categoryPath));
}

export function discountedProducts(): Product[] {
  return catalog.products.filter((product) => product.discountPercent > 0);
}

export function cartLineFromProduct(product: Product, quantity = 1): CartLineItem {
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
