import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { fetchBrands } from "@/lib/api/mock-api";
import { brandUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "All Brands",
  description: "Browse 50+ premium brands across fashion, tech, home, and more.",
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await fetchBrands();

  return (
    <div className="container">
      <h1 className="display-6 fw-bold mb-2">Brands</h1>
      <p className="text-muted mb-4">{brands.length} brands available</p>
      <div className="row g-4">
        {brands.map((brand) => (
          <div key={brand.id} className="col-6 col-md-4 col-lg-3">
            <Link
              href={brandUrl(brand.slug)}
              className="card h-100 border-0 shadow-sm text-decoration-none text-body text-center p-4"
            >
              <CatalogImage
                src={brand.logoUrl}
                alt={brand.name}
                width={80}
                height={80}
                className="mx-auto mb-3 rounded"
              />
              <h2 className="h6 mb-1">{brand.name}</h2>
              <p className="small text-muted mb-0">{brand.productCount} products</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
