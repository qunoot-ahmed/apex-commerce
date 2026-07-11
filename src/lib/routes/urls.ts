import { SITE_URL } from "@/lib/constants";
import type { ProductFilters, SortOption } from "@/types/catalog";

export function absoluteUrl(path: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function homeUrl() {
  return "/";
}

export function productsUrl(filters: ProductFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort && filters.sort !== "relevance") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export function productUrl(slug: string, query?: Record<string, string>): string {
  const base = `/product/${slug}`;
  if (!query || !Object.keys(query).length) return base;
  const params = new URLSearchParams(query);
  return `${base}?${params.toString()}`;
}

export function categoryUrl(pathSegments: string[]): string {
  return `/category/${pathSegments.join("/")}`;
}

export function brandUrl(slug: string): string {
  return `/brand/${slug}`;
}

export function brandsUrl() {
  return "/brands";
}

export function collectionUrl(slug: string): string {
  return `/collection/${slug}`;
}

export function collectionsUrl() {
  return "/collections";
}

export function blogUrl(slug?: string): string {
  return slug ? `/blog/${slug}` : "/blog";
}

export function searchUrl(q: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ q });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) params.set(k, v);
  }
  return `/search?${params.toString()}`;
}

export function storeUrl(segments: string[]): string {
  return `/store/${segments.join("/")}`;
}

export function crawlerTestUrl() {
  return "/crawler-test";
}

export function htmlSitemapUrl() {
  return "/sitemap";
}

export function dealsUrl() {
  return "/deals";
}

export function cartUrl() {
  return "/cart";
}

export function checkoutUrl() {
  return "/checkout";
}

export function parseProductFilters(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters {
  const get = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = parseInt(get("page") ?? "1", 10);
  return {
    category: get("category"),
    brand: get("brand"),
    q: get("q"),
    sort: (get("sort") as SortOption) ?? "relevance",
    page: Number.isNaN(page) ? 1 : page,
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
  };
}
