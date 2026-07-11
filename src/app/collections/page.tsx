import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { fetchCollections } from "@/lib/api/mock-api";
import { collectionUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Collections",
  description: "Curated product collections for every season and occasion.",
  path: "/collections",
});

export default async function CollectionsPage() {
  const collections = await fetchCollections();

  return (
    <div className="container">
      <h1 className="display-6 fw-bold mb-4">Collections</h1>
      <div className="row g-4">
        {collections.map((col) => (
          <div key={col.id} className="col-md-6 col-lg-4">
            <Link href={collectionUrl(col.slug)} className="card border-0 shadow-sm text-decoration-none text-body">
              <div className="ratio ratio-16x9 position-relative">
                <CatalogImage src={col.imageUrl} alt={col.name} fill className="object-fit-cover rounded-top" />
              </div>
              <div className="card-body">
                <h2 className="h5">{col.name}</h2>
                <p className="text-muted small mb-0">{col.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
