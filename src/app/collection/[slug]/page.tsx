import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { fetchCollectionBySlug } from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import { collectionUrl, collectionsUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCatalog().collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const col = await fetchCollectionBySlug(slug);
  if (!col) return {};
  return buildPageMetadata({
    title: col.name,
    description: col.description,
    path: `/collection/${slug}`,
    image: col.imageUrl,
  });
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = await fetchCollectionBySlug(slug);
  if (!collection) notFound();

  const catalog = getCatalog();
  const products = collection.productIds
    .map((id) => catalog.products.find((p) => p.id === id))
    .filter(Boolean) as typeof catalog.products;

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Collections", href: collectionsUrl() },
          { label: collection.name },
        ]}
      />
      <div className="ratio ratio-21x9 mb-4 rounded-4 overflow-hidden position-relative">
        <CatalogImage src={collection.imageUrl} alt={collection.name} fill className="object-fit-cover" />
      </div>
      <h1 className="display-6 fw-bold">{collection.name}</h1>
      <p className="lead text-muted">{collection.description}</p>
      <ProductGrid products={products} />
      <div className="mt-5">
        <h2 className="h6 text-muted">More collections</h2>
        <div className="d-flex flex-wrap gap-2">
          {catalog.collections
            .filter((c) => c.slug !== slug)
            .slice(0, 8)
            .map((c) => (
              <Link key={c.id} href={collectionUrl(c.slug)} className="filter-chip border">
                {c.name}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
