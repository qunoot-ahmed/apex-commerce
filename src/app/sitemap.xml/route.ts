import { getCatalog, getAllCategoryPaths } from "@/lib/data/catalog";
import { SITE_URL } from "@/lib/constants";
import {
  blogUrl,
  brandUrl,
  categoryUrl,
  collectionUrl,
  crawlerTestUrl,
  productUrl,
  productsUrl,
  storeUrl,
} from "@/lib/routes/urls";

function urlEntry(loc: string, priority = 0.7, changefreq = "weekly") {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export async function GET() {
  const catalog = getCatalog();
  const base = SITE_URL.replace(/\/$/, "");
  const entries: string[] = [
    urlEntry(`${base}/`, 1),
    urlEntry(`${base}${productsUrl()}`, 0.9),
    urlEntry(`${base}/brands`, 0.8),
    urlEntry(`${base}/collections`, 0.8),
    urlEntry(`${base}/blog`, 0.8),
    urlEntry(`${base}${crawlerTestUrl()}`, 0.6),
    urlEntry(`${base}/deals`, 0.8),
  ];

  for (const path of getAllCategoryPaths()) {
    entries.push(urlEntry(`${base}${categoryUrl(path)}`, 0.75));
  }
  for (const p of catalog.products) {
    entries.push(urlEntry(`${base}${productUrl(p.slug)}`, 0.7));
  }
  for (const b of catalog.brands) {
    entries.push(urlEntry(`${base}${brandUrl(b.slug)}`, 0.65));
  }
  for (const c of catalog.collections) {
    entries.push(urlEntry(`${base}${collectionUrl(c.slug)}`, 0.7));
  }
  for (const post of catalog.blogPosts) {
    entries.push(urlEntry(`${base}${blogUrl(post.slug)}`, 0.6));
  }
  for (const path of catalog.storePaths) {
    entries.push(urlEntry(`${base}${storeUrl(path.slice(1))}`, 0.55));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
