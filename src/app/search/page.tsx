import Link from "next/link";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SearchBar } from "@/components/search/SearchBar";
import { fetchProducts } from "@/lib/api/mock-api";
import { SEARCH_SUGGESTIONS } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { searchUrl } from "@/lib/routes/urls";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  return buildPageMetadata({
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for "${q}" across our product catalog.`
      : "Search products, brands, and categories.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
  });
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";
  const sort = (Array.isArray(params.sort) ? params.sort[0] : params.sort) as
    | import("@/types/catalog").SortOption
    | undefined;
  const page = parseInt((Array.isArray(params.page) ? params.page[0] : params.page) ?? "1", 10);

  const result = q
    ? await fetchProducts({ q, sort, page })
    : { items: [], total: 0, page: 1, pageSize: 24, totalPages: 0 };

  return (
    <div className="container">
      <h1 className="display-6 fw-bold mb-3">Search</h1>
      <div className="mb-4">
        <SearchBar defaultQuery={q} />
      </div>
      {!q && (
        <div className="mb-4">
          <p className="text-muted">Popular searches:</p>
          <div className="d-flex flex-wrap gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <Link key={s} href={searchUrl(s)} className="filter-chip border text-decoration-none">
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
      {q && (
        <>
          <p className="text-muted mb-3">{result.total} results</p>
          <ProductListing
            title={`Results for "${q}"`}
            description={`Found ${result.total} matching products.`}
            result={result}
            filters={{ q, sort, page }}
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Search" },
              { label: q },
            ]}
          />
        </>
      )}
    </div>
  );
}
