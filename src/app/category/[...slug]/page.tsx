import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/catalog/ProductListing";
import { JsonLd } from "@/components/seo/JsonLd";
import { fetchCategoryByPath, fetchProducts } from "@/lib/api/mock-api";
import { getAllCategoryPaths } from "@/lib/data/catalog";
import { categoryUrl, productsUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/jsonld";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllCategoryPaths().map((path) => ({ slug: path }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await fetchCategoryByPath(slug);
  if (!category) return {};
  return buildPageMetadata({
    title: category.name,
    description: category.description,
    path: `/category/${slug.join("/")}`,
    image: category.imageUrl,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await fetchCategoryByPath(slug);
  if (!category) notFound();

  const categoryPath = slug.join("/");
  const result = await fetchProducts({ category: categoryPath });
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Categories", href: productsUrl() },
    ...slug.map((seg, i) => ({
      label: seg,
      href: i < slug.length - 1 ? categoryUrl(slug.slice(0, i + 1)) : undefined,
    })),
  ];

  const schemaCrumbs = [
    { name: "Home", path: "/" },
    ...slug.map((_, i) => ({
      name: slug[i]!,
      path: `/category/${slug.slice(0, i + 1).join("/")}`,
    })),
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(schemaCrumbs)} />
      {category.children.length > 0 && (
        <div className="container mb-4">
          <h2 className="h6 text-uppercase text-muted">Subcategories</h2>
          <div className="d-flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={categoryUrl(child.path)}
                className="filter-chip border text-decoration-none"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <ProductListing
        title={category.name}
        description={category.description}
        result={result}
        filters={{ category: categoryPath }}
        breadcrumbs={breadcrumbs}
      />
    </>
  );
}
