import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { fetchProducts } from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import {
  blogUrl,
  brandsUrl,
  categoryUrl,
  collectionUrl,
  crawlerTestUrl,
  dealsUrl,
  productsUrl,
} from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Apex Commerce — Premium Online Shopping",
  description:
    "Discover 500+ products across fashion, electronics, home, sports, and beauty. Enterprise ecommerce with deep navigation and SEO-ready architecture.",
  path: "/",
});

export default async function HomePage() {
  const catalog = getCatalog();
  const featured = await fetchProducts({}, 8);
  const featuredItems = catalog.products.filter((p) => p.featured).slice(0, 8);
  const display = featuredItems.length ? featuredItems : featured.items;

  return (
    <>
      <section className="hero-gradient text-white py-5 mb-5">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <p className="text-uppercase small opacity-75 mb-2">New Season</p>
              <h1 className="display-4 fw-bold mb-3">
                Shop the brands you love. Discover what&apos;s next.
              </h1>
              <p className="lead opacity-90 mb-4">
                Curated collections, editorial guides, and a crawl-ready catalog built for scale.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href={productsUrl()} className="btn btn-light btn-lg">
                  Shop All
                </Link>
                <Link href={dealsUrl()} className="btn btn-outline-light btn-lg">
                  View Deals
                </Link>
                <Link href={crawlerTestUrl()} className="btn btn-outline-light btn-lg">
                  Crawler Test
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <h2 className="h3 fw-bold mb-0">Shop by Category</h2>
            <Link href={productsUrl()} className="text-decoration-none">
              View all →
            </Link>
          </div>
          <div className="row g-3">
            {catalog.categories.map((cat) => (
              <div key={cat.id} className="col-6 col-md-4 col-lg-2">
                <Link
                  href={categoryUrl(cat.path)}
                  className="card border-0 shadow-sm h-100 text-decoration-none text-body apex-animate-in"
                >
                  <div className="ratio ratio-4x3 position-relative">
                    <CatalogImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-fit-cover rounded-top"
                      sizes="200px"
                    />
                  </div>
                  <div className="card-body py-2 text-center">
                    <span className="fw-semibold">{cat.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5">
          <h2 className="h3 fw-bold mb-4">Featured Products</h2>
          <ProductGrid products={display} />
        </section>

        <section className="mb-5">
          <h2 className="h3 fw-bold mb-4">Collections</h2>
          <div className="row g-3">
            {catalog.collections.slice(0, 6).map((col) => (
              <div key={col.id} className="col-md-4">
                <Link
                  href={collectionUrl(col.slug)}
                  className="card border-0 overflow-hidden text-white text-decoration-none"
                >
                  <div className="ratio ratio-21x9 position-relative">
                    <CatalogImage src={col.imageUrl} alt={col.name} fill className="object-fit-cover" />
                    <div className="position-absolute bottom-0 start-0 p-3 bg-dark bg-opacity-50 w-100">
                      <h3 className="h5 mb-0">{col.name}</h3>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="p-4 border rounded-4 h-100">
              <h2 className="h4">Top Brands</h2>
              <p className="text-muted">Explore {catalog.brands.length}+ premium brands.</p>
              <Link href={brandsUrl()} className="btn btn-dark">
                Browse Brands
              </Link>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-4 border rounded-4 h-100">
              <h2 className="h4">Editorial</h2>
              <p className="text-muted">{catalog.blogPosts.length}+ guides and trend reports.</p>
              <Link href={blogUrl()} className="btn btn-outline-dark">
                Read Blog
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
