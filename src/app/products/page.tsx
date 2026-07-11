import { ProductListing } from "@/components/catalog/ProductListing";
import { fetchProducts } from "@/lib/api/mock-api";
import { parseProductFilters } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProductFilters(params);
  const title =
    filters.page && filters.page > 1
      ? `Products — Page ${filters.page}`
      : "All Products";
  return buildPageMetadata({
    title,
    description: "Browse our full product catalog with filters, sorting, and pagination.",
    path: "/products",
  });
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseProductFilters(params);
  const result = await fetchProducts(filters);

  return (
    <ProductListing
      title="All Products"
      description="Filter by category, brand, price, and sort order. Every combination generates discoverable URLs for SEO and crawler testing."
      result={result}
      filters={filters}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Products" },
      ]}
    />
  );
}
