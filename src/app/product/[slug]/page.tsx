import { CatalogImage } from "@/components/ui/CatalogImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import Link from "next/link";
import Rating from "@mui/material/Rating";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
} from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import {
  brandUrl,
  categoryUrl,
  productUrl,
  productsUrl,
} from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchema } from "@/lib/seo/jsonld";
import { effectivePrice, formatPrice } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateStaticParams() {
  return getCatalog().products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};
  return buildPageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/product/${slug}`,
    image: product.image.src,
    type: "product",
  });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchRelatedProducts(product);
  const salePrice = effectivePrice(product.price, product.discountPercent);
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: productsUrl() },
    ...product.categoryPath.map((seg, i) => ({
      label: seg,
      href: categoryUrl(product.categoryPath.slice(0, i + 1)),
    })),
    { label: product.name },
  ];

  const utmNote =
    query.utm_source || query.utm_campaign
      ? `Campaign: ${[query.utm_source, query.utm_campaign].filter(Boolean).join(" / ")}`
      : null;

  return (
    <div className="container">
      <JsonLd
        data={[
          productSchema(product),
          breadcrumbSchema(
            crumbs
              .filter((c) => c.href)
              .map((c) => ({ name: c.label, path: c.href! }))
              .concat({ name: product.name, path: `/product/${slug}` })
          ),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <div className="row g-5 mb-5">
        <div className="col-lg-6">
          <div className="ratio ratio-1x1 position-relative rounded-4 overflow-hidden bg-light mb-3">
            <CatalogImage
              src={product.image.src}
              alt={product.image.alt}
              fill
              className="object-fit-cover"
              priority
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>
          {product.images.length > 1 && (
            <div className="row g-2">
              {product.images.map((img, idx) => (
                <div key={img} className="col-3">
                  <div className="ratio ratio-1x1 position-relative rounded-3 overflow-hidden border">
                    <CatalogImage
                      src={img}
                      alt={`${product.image.alt}, view ${idx + 1}`}
                      fill
                      className="object-fit-cover"
                      sizes="120px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-lg-6">
          <p className="text-muted text-uppercase small">
            <Link href={brandUrl(product.brandSlug)}>{product.brandSlug}</Link>
            {" · "}
            SKU {product.sku}
          </p>
          <h1 className="display-6 fw-bold">{product.name}</h1>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Rating value={product.rating} precision={0.1} readOnly />
            <span className="text-muted">
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>
          <div className="d-flex align-items-baseline gap-3 mb-4">
            <span className="fs-2 fw-bold">{formatPrice(salePrice)}</span>
            {product.discountPercent > 0 && (
              <span className="text-muted text-decoration-line-through fs-5">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <p className="lead">{product.shortDescription}</p>
          <p>{product.description}</p>
          <p className="small">
            <strong>Stock:</strong>{" "}
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </p>
          <AddToCartButton product={product} />
          {utmNote && <p className="small text-muted mt-2">{utmNote}</p>}
          <div className="mt-4 d-flex flex-wrap gap-2 small">
            <Link href={productUrl(slug, { utm_source: "google" })}>UTM: Google</Link>
            <span>·</span>
            <Link href={productUrl(slug, { utm_source: "facebook" })}>UTM: Facebook</Link>
            <span>·</span>
            <Link href={productUrl(slug, { utm_campaign: "spring_sale" })}>
              UTM: Spring Sale
            </Link>
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 fw-bold mb-3">Customer Reviews</h2>
          {product.reviews.map((r) => (
            <div key={r.id} className="border-bottom py-3">
              <Rating value={r.rating} readOnly size="small" />
              <strong className="ms-2">{r.title}</strong>
              <p className="mb-0 mt-1">{r.body}</p>
              <span className="small text-muted">
                {r.author} — {r.date}
              </span>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2 className="h4 fw-bold mb-4">Related Products</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
