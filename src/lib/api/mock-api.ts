import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getCatalog, getFlatCategories } from "@/lib/data/catalog";
import type {
  BlogPost,
  Brand,
  Category,
  Collection,
  PaginatedResult,
  Product,
  ProductFilters,
  SortOption,
} from "@/types/catalog";

function effectivePrice(p: Product): number {
  return p.price * (1 - p.discountPercent / 100);
}

function filterProducts(filters: ProductFilters): Product[] {
  const catalog = getCatalog();
  let items = [...catalog.products];

  if (filters.category) {
    items = items.filter((p) =>
      p.categoryPath.join("/").includes(filters.category!) ||
      p.categoryPath[p.categoryPath.length - 1] === filters.category
    );
  }
  if (filters.brand) {
    items = items.filter((p) => p.brandSlug === filters.brand);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.includes(q))
    );
  }
  if (filters.minPrice != null) {
    items = items.filter((p) => effectivePrice(p) >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    items = items.filter((p) => effectivePrice(p) <= filters.maxPrice!);
  }

  const sort = filters.sort ?? "relevance";
  items.sort((a, b) => sortComparator(a, b, sort));
  return items;
}

function sortComparator(a: Product, b: Product, sort: SortOption): number {
  switch (sort) {
    case "price_asc":
      return effectivePrice(a) - effectivePrice(b);
    case "price_desc":
      return effectivePrice(b) - effectivePrice(a);
    case "rating":
      return b.rating - a.rating;
    case "newest":
      return b.id.localeCompare(a.id);
    default:
      return 0;
  }
}

export async function fetchProducts(
  filters: ProductFilters = {},
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Product>> {
  const page = Math.max(1, filters.page ?? 1);
  const all = filterProducts(filters);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  return getCatalog().productBySlug.get(slug) ?? null;
}

export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  return getCatalog().brands.find((b) => b.slug === slug) ?? null;
}

export async function fetchBrands(): Promise<Brand[]> {
  return getCatalog().brands;
}

export async function fetchCategoryByPath(path: string[]): Promise<Category | null> {
  return getCatalog().categoryByPath.get(path.join("/")) ?? null;
}

export async function fetchCategories(): Promise<Category[]> {
  return getCatalog().categories;
}

export async function fetchCollectionBySlug(slug: string): Promise<Collection | null> {
  return getCatalog().collections.find((c) => c.slug === slug) ?? null;
}

export async function fetchCollections(): Promise<Collection[]> {
  return getCatalog().collections;
}

export async function fetchBlogPosts(page = 1, pageSize = 12): Promise<PaginatedResult<BlogPost>> {
  const all = getCatalog().blogPosts;
  const total = all.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  return getCatalog().blogPosts.find((b) => b.slug === slug) ?? null;
}

export async function fetchRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const catalog = getCatalog();
  return catalog.products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.brandId === product.brandId || p.categoryId === product.categoryId)
    )
    .slice(0, limit);
}

export async function searchSuggestions(query: string): Promise<string[]> {
  const q = query.toLowerCase();
  const catalog = getCatalog();
  const names = catalog.products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => p.name);
  const brands = catalog.brands
    .filter((b) => b.name.toLowerCase().includes(q))
    .slice(0, 3)
    .map((b) => b.name);
  return [...new Set([...names, ...brands])];
}

export function getProductsForStorePath(segments: string[]): Product[] {
  const catalog = getCatalog();
  const brandSlug = segments[segments.length - 1];
  const categoryParts = segments.slice(0, -1);
  return catalog.products.filter((p) => {
    const brandMatch = p.brandSlug === brandSlug;
    const catMatch =
      categoryParts.length === 0 ||
      categoryParts.every((part, i) => p.categoryPath[i] === part || p.categoryPath.includes(part));
    return brandMatch || catMatch;
  }).slice(0, 48);
}

export { getFlatCategories };
