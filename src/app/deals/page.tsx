import { ProductListing } from "@/components/catalog/ProductListing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Deals & Promotions",
  description: "Today's best deals — discounted products across all categories.",
  path: "/deals",
});

export default async function DealsPage() {
  const catalog = (await import("@/lib/data/catalog")).getCatalog();
  const discounted = catalog.products.filter((p) => p.discountPercent > 0);
  const result = {
    items: discounted.slice(0, 24),
    total: discounted.length,
    page: 1,
    pageSize: 24,
    totalPages: Math.ceil(discounted.length / 24),
  };

  return (
    <ProductListing
      title="Today's Deals"
      description="Save on top brands — limited-time discounts across the catalog."
      result={result}
      filters={{ sort: "price_desc" }}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Deals" },
      ]}
    />
  );
}
