import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { fetchBlogPosts } from "@/lib/api/mock-api";
import { blogUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils/format";

export const metadata = buildPageMetadata({
  title: "Blog & Guides",
  description: "Shopping guides, trend reports, and product editorial from Apex Commerce.",
  path: "/blog",
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(
    (Array.isArray(params.page) ? params.page[0] : params.page) ?? "1",
    10
  );
  const result = await fetchBlogPosts(page);

  return (
    <div className="container">
      <h1 className="display-6 fw-bold mb-4">Blog</h1>
      <div className="row g-4">
        {result.items.map((post) => (
          <div key={post.id} className="col-md-6 col-lg-4">
            <article className="card h-100 border-0 shadow-sm">
              <Link href={blogUrl(post.slug)} className="text-decoration-none text-body">
                <div className="ratio ratio-16x9 position-relative">
                  <CatalogImage src={post.imageUrl} alt={post.title} fill className="object-fit-cover rounded-top" />
                </div>
                <div className="card-body">
                  <h2 className="h5 line-clamp-2">{post.title}</h2>
                  <p className="text-muted small">{formatDate(post.publishedAt)} · {post.author}</p>
                  <p className="small mb-0">{post.excerpt}</p>
                </div>
              </Link>
            </article>
          </div>
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} basePath="/blog" />
    </div>
  );
}
