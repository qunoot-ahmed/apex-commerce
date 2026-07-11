import { CatalogImage } from "@/components/ui/CatalogImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchBlogBySlug } from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import { blogUrl, categoryUrl, productUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getCatalog().blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: post.imageUrl,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchBlogBySlug(slug);
  if (!post) notFound();

  const catalog = getCatalog();
  const relatedPosts = catalog.blogPosts.filter((p) => p.slug !== slug).slice(0, 5);
  const relatedProducts = catalog.products.slice(0, 4);

  return (
    <article className="container">
      <JsonLd data={articleSchema(post)} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: blogUrl() },
          { label: post.title },
        ]}
      />
      <header className="mb-4">
        <h1 className="display-5 fw-bold">{post.title}</h1>
        <p className="text-muted">
          {formatDate(post.publishedAt)} · {post.author}
        </p>
      </header>
      <div className="ratio ratio-21x9 mb-4 rounded-4 overflow-hidden position-relative">
        <CatalogImage src={post.imageUrl} alt={post.title} fill className="object-fit-cover" priority />
      </div>
      <div className="row">
        <div className="col-lg-8">
          <p className="lead">{post.excerpt}</p>
          <div className="blog-content">
            {post.content.split("\n").map((line, i) => {
              if (line.startsWith("## "))
                return <h2 key={i} className="h4 mt-4">{line.slice(3)}</h2>;
              if (line.startsWith("### "))
                return <h3 key={i} className="h5 mt-3">{line.slice(4)}</h3>;
              if (line.startsWith("- "))
                return <li key={i}>{line.slice(2)}</li>;
              if (!line.trim()) return <br key={i} />;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
        <aside className="col-lg-4">
          <h2 className="h6 text-uppercase text-muted">Related posts</h2>
          <ul className="list-unstyled">
            {relatedPosts.map((p) => (
              <li key={p.id} className="mb-2">
                <Link href={blogUrl(p.slug)}>{p.title}</Link>
              </li>
            ))}
          </ul>
          <h2 className="h6 text-uppercase text-muted mt-4">Featured products</h2>
          <ul className="list-unstyled">
            {relatedProducts.map((p) => (
              <li key={p.id} className="mb-2">
                <Link href={productUrl(p.slug)}>{p.name}</Link>
              </li>
            ))}
          </ul>
          <Link href={categoryUrl([post.categorySlug])} className="btn btn-outline-dark btn-sm mt-3">
            Shop {post.categorySlug}
          </Link>
        </aside>
      </div>
    </article>
  );
}
