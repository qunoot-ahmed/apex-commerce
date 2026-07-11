import Link from "next/link";
import { productsUrl } from "@/lib/routes/urls";
import type { ProductFilters } from "@/types/catalog";

interface PaginationProps {
  page: number;
  totalPages: number;
  filters?: ProductFilters;
  basePath?: string;
}

function pageHref(page: number, filters: ProductFilters, basePath?: string) {
  if (basePath) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }
  return productsUrl({ ...filters, page });
}

export function Pagination({ page, totalPages, filters = {}, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= totalPages - 3) return totalPages - 6 + i;
    return page - 3 + i;
  });

  return (
    <nav aria-label="Pagination" className="apex-pagination mt-4">
      <ul className="pagination justify-content-center flex-wrap gap-1">
        <li className={`page-item${page <= 1 ? " disabled" : ""}`}>
          {page > 1 ? (
            <Link className="page-link" href={pageHref(page - 1, filters, basePath)}>
              Previous
            </Link>
          ) : (
            <span className="page-link">Previous</span>
          )}
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item${p === page ? " active" : ""}`}>
            <Link className="page-link" href={pageHref(p, filters, basePath)}>
              {p}
            </Link>
          </li>
        ))}
        <li className={`page-item${page >= totalPages ? " disabled" : ""}`}>
          {page < totalPages ? (
            <Link className="page-link" href={pageHref(page + 1, filters, basePath)}>
              Next
            </Link>
          ) : (
            <span className="page-link">Next</span>
          )}
        </li>
      </ul>
    </nav>
  );
}
