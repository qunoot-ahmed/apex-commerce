import Link from "next/link";
import { getCatalog, getAllCategoryPaths } from "@/lib/data/catalog";
import {
  blogUrl,
  brandUrl,
  categoryUrl,
  collectionUrl,
  crawlerTestUrl,
  productUrl,
  productsUrl,
  searchUrl,
} from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SEARCH_SUGGESTIONS } from "@/lib/constants";

export const metadata = buildPageMetadata({
  title: "HTML Sitemap",
  description: "Human-readable sitemap of all major sections, categories, products, and blogs.",
  path: "/sitemap",
});

export default function HtmlSitemapPage() {
  const catalog = getCatalog();
  const categories = getAllCategoryPaths();

  return (
    <div className="container">
      <h1 className="display-6 fw-bold mb-4">HTML Sitemap</h1>

      <section className="mb-5">
        <h2 className="h5">Main</h2>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={productsUrl()}>Products</Link></li>
          <li><Link href="/brands">Brands</Link></li>
          <li><Link href="/collections">Collections</Link></li>
          <li><Link href={blogUrl()}>Blog</Link></li>
          <li><Link href={crawlerTestUrl()}>Crawler Test</Link></li>
          <li><Link href="/sitemap.xml">XML Sitemap</Link></li>
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h5">Categories ({categories.length})</h2>
        <ul className="columns-2">
          {categories.map((path) => (
            <li key={path.join("/")}>
              <Link href={categoryUrl(path)}>{path.join(" / ")}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h5">Brands</h2>
        <ul className="columns-3">
          {catalog.brands.map((b) => (
            <li key={b.id}><Link href={brandUrl(b.slug)}>{b.name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h5">Products (sample)</h2>
        <ul className="columns-3">
          {catalog.products.slice(0, 100).map((p) => (
            <li key={p.id}><Link href={productUrl(p.slug)}>{p.name}</Link></li>
          ))}
        </ul>
        <p className="text-muted small">
          <Link href={crawlerTestUrl()}>View all {catalog.products.length} via Crawler Test</Link>
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h5">Search</h2>
        <ul>
          {SEARCH_SUGGESTIONS.map((q) => (
            <li key={q}><Link href={searchUrl(q)}>{q}</Link></li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="h5">Collections</h2>
        <ul>
          {catalog.collections.map((c) => (
            <li key={c.id}><Link href={collectionUrl(c.slug)}>{c.name}</Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
