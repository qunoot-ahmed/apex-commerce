import Link from "next/link";
import { getCatalog } from "@/lib/data/catalog";
import { SITE_NAME } from "@/lib/constants";
import {
  blogUrl,
  brandsUrl,
  categoryUrl,
  collectionUrl,
  crawlerTestUrl,
  htmlSitemapUrl,
  productsUrl,
  searchUrl,
} from "@/lib/routes/urls";

export function Footer() {
  const catalog = getCatalog();
  const topCategories = catalog.categories.slice(0, 6);
  const topBrands = catalog.brands.slice(0, 8);
  const topCollections = catalog.collections.slice(0, 6);

  return (
    <footer className="apex-footer bg-dark text-white mt-auto">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <h2 className="h4 fw-bold">{SITE_NAME}</h2>
            <p className="text-white-50">
              Enterprise-grade shopping experience with curated brands, editorial content, and
              seamless discovery across thousands of URLs.
            </p>
            <Link href={crawlerTestUrl()} className="btn btn-outline-light btn-sm">
              Crawler Test Hub
            </Link>
          </div>
          <div className="col-6 col-lg-2">
            <h3 className="h6 text-uppercase">Shop</h3>
            <ul className="list-unstyled small">
              <li>
                <Link href={productsUrl()} className="text-white-50">
                  All Products
                </Link>
              </li>
              {topCategories.map((c) => (
                <li key={c.id}>
                  <Link href={categoryUrl(c.path)} className="text-white-50">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h3 className="h6 text-uppercase">Brands</h3>
            <ul className="list-unstyled small">
              <li>
                <Link href={brandsUrl()} className="text-white-50">
                  All Brands
                </Link>
              </li>
              {topBrands.map((b) => (
                <li key={b.id}>
                  <Link href={`/brand/${b.slug}`} className="text-white-50">
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h3 className="h6 text-uppercase">Collections</h3>
            <ul className="list-unstyled small">
              {topCollections.map((c) => (
                <li key={c.id}>
                  <Link href={collectionUrl(c.slug)} className="text-white-50">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h3 className="h6 text-uppercase">Company</h3>
            <ul className="list-unstyled small">
              <li>
                <Link href="/about" className="text-white-50">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white-50">
                  Contact
                </Link>
              </li>
              <li>
                <Link href={blogUrl()} className="text-white-50">
                  Blog
                </Link>
              </li>
              <li>
                <Link href={htmlSitemapUrl()} className="text-white-50">
                  HTML Sitemap
                </Link>
              </li>
              <li>
                <Link href={searchUrl("sale")} className="text-white-50">
                  Search: Sale
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-top border-secondary mt-4 pt-4 small text-white-50 d-flex flex-wrap justify-content-between gap-2">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>
            <Link href="/privacy" className="text-white-50 me-3">
              Privacy
            </Link>
            <Link href="/terms" className="text-white-50">
              Terms
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
