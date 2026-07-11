import {
  MAX_PAGINATION_PAGES,
  SEARCH_SUGGESTIONS,
  SORT_OPTIONS,
  UTM_CAMPAIGNS,
  UTM_SOURCES,
} from "@/lib/constants";
import { getCatalog, getAllCategoryPaths, getFlatCategories } from "@/lib/data/catalog";
import {
  absoluteUrl,
  blogUrl,
  brandUrl,
  categoryUrl,
  collectionUrl,
  productUrl,
  productsUrl,
  searchUrl,
  storeUrl,
} from "@/lib/routes/urls";

export interface CrawlerLink {
  href: string;
  label: string;
  group: string;
}

export function generateCrawlerLinks(): CrawlerLink[] {
  const catalog = getCatalog();
  const links: CrawlerLink[] = [];

  for (const p of catalog.products) {
    links.push({
      href: productUrl(p.slug),
      label: p.name,
      group: "Products",
    });
  }

  for (const b of catalog.brands) {
    links.push({ href: brandUrl(b.slug), label: b.name, group: "Brands" });
  }

  for (const path of getAllCategoryPaths()) {
    links.push({
      href: categoryUrl(path),
      label: path.join(" / "),
      group: "Categories",
    });
  }

  for (const c of catalog.collections) {
    links.push({
      href: collectionUrl(c.slug),
      label: c.name,
      group: "Collections",
    });
  }

  for (const post of catalog.blogPosts) {
    links.push({
      href: blogUrl(post.slug),
      label: post.title,
      group: "Blog",
    });
  }

  for (const q of SEARCH_SUGGESTIONS) {
    links.push({ href: searchUrl(q), label: `Search: ${q}`, group: "Search" });
  }

  for (let page = 1; page <= MAX_PAGINATION_PAGES; page++) {
    links.push({
      href: productsUrl({ page }),
      label: `Products page ${page}`,
      group: "Pagination",
    });
  }

  const flatCats = getFlatCategories().slice(0, 15);
  const topBrands = catalog.brands.slice(0, 10);
  for (const cat of flatCats) {
    for (const brand of topBrands) {
      for (const sort of SORT_OPTIONS) {
        links.push({
          href: productsUrl({
            category: cat.path.join("/"),
            brand: brand.slug,
            sort: sort.value,
            page: (links.length % 5) + 1,
          }),
          label: `Filter: ${cat.path.at(-1)} + ${brand.slug} + ${sort.value}`,
          group: "Filters",
        });
      }
    }
  }

  for (const p of catalog.products.slice(0, 30)) {
    for (const src of UTM_SOURCES) {
      links.push({
        href: productUrl(p.slug, { utm_source: src }),
        label: `${p.slug} ?utm_source=${src}`,
        group: "UTM",
      });
    }
    for (const camp of UTM_CAMPAIGNS) {
      links.push({
        href: productUrl(p.slug, { utm_campaign: camp }),
        label: `${p.slug} ?utm_campaign=${camp}`,
        group: "UTM Campaign",
      });
    }
  }

  for (const path of catalog.storePaths) {
    links.push({
      href: storeUrl(path.slice(1)),
      label: path.join(" / "),
      group: "Deep Store",
    });
  }

  return links;
}

export function getCrawlerLinkStats(links: CrawlerLink[]) {
  const groups = new Map<string, number>();
  for (const l of links) {
    groups.set(l.group, (groups.get(l.group) ?? 0) + 1);
  }
  return {
    total: links.length,
    uniqueHrefs: new Set(links.map((l) => absoluteUrl(l.href))).size,
    groups: Object.fromEntries(groups),
  };
}
