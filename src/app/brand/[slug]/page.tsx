import { CatalogImage } from "@/components/ui/CatalogImage";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/catalog/ProductListing";
import { fetchBrandBySlug, fetchProducts } from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCatalog().brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return {};
  return buildPageMetadata({
    title: `${brand.name} Brand Shop`,
    description: brand.description,
    path: `/brand/${slug}`,
    image: brand.logoUrl,
  });
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) notFound();

  const result = await fetchProducts({ brand: slug });

  return (
    <>
      <div className="container mb-4">
        <div className="d-flex align-items-center gap-4">
          <CatalogImage src={brand.logoUrl} alt={brand.name} width={96} height={96} className="rounded" />
          <div>
            <h1 className="display-6 fw-bold mb-1">{brand.name}</h1>
            <p className="text-muted mb-0">{brand.description}</p>
          </div>
        </div>
      </div>
      <ProductListing
        title={`${brand.name} Products`}
        description={`${brand.productCount} products from ${brand.name}.`}
        result={result}
        filters={{ brand: slug }}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Brands", href: "/brands" },
          { label: brand.name },
        ]}
      />
    </>
  );
}
