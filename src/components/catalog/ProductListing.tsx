import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Pagination } from "@/components/ui/Pagination";
import { SORT_OPTIONS } from "@/lib/constants";
import { productsUrl } from "@/lib/routes/urls";
import type { PaginatedResult, Product, ProductFilters } from "@/types/catalog";

interface ProductListingProps {
  title: string;
  description: string;
  result: PaginatedResult<Product>;
  filters: ProductFilters;
  breadcrumbs: { label: string; href?: string }[];
}

export function ProductListing({
  title,
  description,
  result,
  filters,
  breadcrumbs,
}: ProductListingProps) {
  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbs} />
      <header className="mb-4">
        <h1 className="display-6 fw-bold">{title}</h1>
        <p className="text-muted">{description}</p>
        <p className="small text-muted">{result.total} products</p>
      </header>

      <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
        <span className="text-muted small me-2">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={productsUrl({ ...filters, sort: opt.value, page: 1 })}
            className={`filter-chip border text-decoration-none ${
              (filters.sort ?? "relevance") === opt.value ? "bg-dark text-white" : "bg-body"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <ProductGrid products={result.items} />
      <Pagination page={result.page} totalPages={result.totalPages} filters={filters} />
    </div>
  );
}
