import { buildCatalog } from "@/lib/data/generators";
import type { Catalog } from "@/types/catalog";

let cache: Catalog | null = null;

export function getCatalog(): Catalog {
  if (!cache) {
    cache = buildCatalog();
  }
  return cache;
}

export function getAllCategoryPaths(): string[][] {
  const catalog = getCatalog();
  const paths: string[][] = [];
  function walk(cats: Catalog["categories"]) {
    for (const c of cats) {
      paths.push(c.path);
      if (c.children.length) walk(c.children);
    }
  }
  walk(catalog.categories);
  return paths;
}

export function getFlatCategories() {
  const paths = getAllCategoryPaths();
  const catalog = getCatalog();
  return paths.map((p) => catalog.categoryByPath.get(p.join("/"))!).filter(Boolean);
}
