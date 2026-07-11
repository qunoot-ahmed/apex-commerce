import manifest from "@/lib/images/product-image-manifest.json";
import type { ProductImage } from "@/types/catalog";

/**
 * Manifest-driven local product photo selection.
 *
 * Product records never call a random endpoint at render time. Each product is
 * assigned an explicit archetype and a local photo from the manifest.
 */

export type ImageCategory =
  | "shoes"
  | "apparel"
  | "electronics"
  | "accessories"
  | "home"
  | "sports"
  | "beauty"
  | "kids"
  | "default";

const CATEGORY_ROOT_MAP: Record<string, ImageCategory> = {
  fashion: "apparel",
  electronics: "electronics",
  home: "home",
  sports: "sports",
  beauty: "beauty",
  kids: "kids",
};

const CATEGORY_SEGMENT_MAP: Record<string, ImageCategory> = {
  shoes: "shoes",
  clothing: "apparel",
  accessories: "accessories",
  phones: "electronics",
  computers: "electronics",
  audio: "electronics",
  tv: "electronics",
  furniture: "home",
  kitchen: "home",
  decor: "home",
  running: "sports",
  training: "sports",
  outdoor: "sports",
  skincare: "beauty",
  makeup: "beauty",
  fragrance: "beauty",
  toys: "kids",
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().trim();
}

function localImage(category: ImageCategory, seed: string, variant = 0): string {
  const variants = 4;
  const index = ((hashString(seed) + variant) % variants) + 1;
  return `/images/products/${category}-${index}.svg`;
}

export interface ProductArchetype {
  key: string;
  label: string;
  category: ImageCategory;
  alt: string;
  allowedRoots: string[];
  allowedSegments: string[];
  images: string[];
}

export const PRODUCT_ARCHETYPES = manifest.archetypes as ProductArchetype[];

const ARCHETYPE_BY_KEY = new Map(PRODUCT_ARCHETYPES.map((item) => [item.key, item]));

function archetype(key: string): ProductArchetype {
  const found = ARCHETYPE_BY_KEY.get(key);
  if (!found) throw new Error(`Missing product image archetype: ${key}`);
  return found;
}

function hasSegment(path: string[], candidates: string[]): boolean {
  return path.some((segment) =>
    candidates.includes(normalizeKey(segment).replace(/\s+/g, "-"))
  );
}

export function getArchetypeForCategory(categoryPath: string[], index: number): ProductArchetype {
  const root = normalizeKey(categoryPath[0] ?? "");
  const path = categoryPath.map((segment) => normalizeKey(segment).replace(/\s+/g, "-"));

  if (root === "fashion") {
    if (path.includes("shoes")) return archetype(index % 2 === 0 ? "sneaker" : "running-shoe");
    if (path.includes("outerwear")) return archetype("jacket");
    if (path.includes("bottoms")) return archetype("jeans");
    if (path.includes("bags")) return archetype("backpack");
    if (path.includes("hats")) return archetype("baseball-cap");
    if (path.includes("accessories")) return archetype(index % 2 === 0 ? "backpack" : "baseball-cap");
    if (path.includes("tops")) return archetype(index % 2 === 0 ? "hoodie" : "polo-shirt");
    return archetype(["hoodie", "polo-shirt", "dress", "jeans"][index % 4]!);
  }

  if (root === "electronics") {
    if (hasSegment(path, ["phones", "smartphones"])) return archetype("smartphone");
    if (path.includes("laptops")) return archetype("laptop");
    if (path.includes("tablets")) return archetype("tablet");
    if (path.includes("computers")) return archetype(index % 2 === 0 ? "laptop" : "laptop-sleeve");
    if (path.includes("headphones")) return archetype("headphones");
    if (path.includes("speakers")) return archetype("bluetooth-speaker");
    if (path.includes("audio")) return archetype(index % 2 === 0 ? "headphones" : "bluetooth-speaker");
    if (hasSegment(path, ["tv", "4k", "oled"])) return archetype("television");
    return archetype(["smartphone", "laptop", "headphones", "smartwatch"][index % 4]!);
  }

  if (root === "home") {
    if (path.includes("kitchen") || path.includes("cookware") || path.includes("appliances")) {
      return archetype("cookware");
    }
    if (path.includes("decor") || path.includes("lighting") || path.includes("rugs")) {
      return archetype("table-lamp");
    }
    return archetype("accent-chair");
  }

  if (root === "sports") {
    if (path.includes("running") || path.includes("shoes")) return archetype("running-shoe");
    if (path.includes("apparel")) return archetype(index % 2 === 0 ? "hoodie" : "jacket");
    if (path.includes("outdoor") || path.includes("camping") || path.includes("hiking")) {
      return archetype(index % 2 === 0 ? "backpack" : "water-bottle");
    }
    return archetype(index % 2 === 0 ? "yoga-mat" : "water-bottle");
  }

  if (root === "beauty") {
    if (path.includes("makeup") || path.includes("face") || path.includes("eyes")) return archetype("makeup");
    if (path.includes("fragrance") || path.includes("men") || path.includes("women")) return archetype("fragrance");
    return archetype("skincare");
  }

  if (root === "kids") {
    if (path.includes("toys") || path.includes("educational") || path.includes("outdoor")) return archetype("toy");
    return archetype(index % 2 === 0 ? "hoodie" : "sneaker");
  }

  return archetype("sneaker");
}

export function getProductImageSet(
  archetypeKey: string,
  productName: string,
  index: number
): { image: ProductImage; images: string[] } {
  const item = archetype(archetypeKey);
  const primaryIndex = index % item.images.length;
  const secondaryIndex = (primaryIndex + 1) % item.images.length;
  const primary = item.images[primaryIndex]!;
  const secondary = item.images[secondaryIndex]!;

  return {
    image: {
      src: primary,
      alt: `${item.alt} for ${productName}`,
      width: 800,
      height: 800,
      category: item.category,
      productType: item.key,
    },
    images: [primary, secondary],
  };
}

export function getCategoryImage(categoryPath: string[], categoryId: string): string {
  for (let i = categoryPath.length - 1; i >= 0; i--) {
    const seg = normalizeKey(categoryPath[i]!);
    if (CATEGORY_SEGMENT_MAP[seg]) {
      return localImage(CATEGORY_SEGMENT_MAP[seg]!, `${categoryId}-${seg}`);
    }
  }
  const root = normalizeKey(categoryPath[0] ?? "default");
  const cat = CATEGORY_ROOT_MAP[root] ?? "default";
  return `/images/categories/${cat}.svg`;
}

export function getCollectionImage(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (lower.includes("tech") || lower.includes("smart")) return localImage("electronics", name);
  if (lower.includes("beauty")) return localImage("beauty", name);
  if (lower.includes("running") || lower.includes("fitness") || lower.includes("athleisure"))
    return localImage("sports", name);
  if (lower.includes("outdoor")) return localImage("sports", name);
  if (lower.includes("home")) return localImage("home", name);
  if (lower.includes("kid")) return localImage("kids", name);
  return localImage("apparel", `col-${name}-${index}`);
}

export function getBlogImage(title: string, index: number): string {
  const lower = title.toLowerCase();
  if (lower.includes("running") || lower.includes("workout")) return localImage("sports", title);
  if (lower.includes("fashion")) return localImage("apparel", title);
  if (lower.includes("smart") || lower.includes("tech")) return localImage("electronics", title);
  if (lower.includes("skin")) return localImage("beauty", title);
  return `/images/editorial-${(index % 3) + 1}.svg`;
}

export function getBrandLogoUrl(name: string): string {
  const idx = (hashString(name) % 6) + 1;
  return `/images/brands/badge-${idx}.svg`;
}

export const OG_DEFAULT_IMAGE = "/images/og-default.svg";

export const FALLBACK_PRODUCT_IMAGE = "/images/products/default-1.svg";
