import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getProductsForStorePath } from "@/lib/api/mock-api";
import { getCatalog } from "@/lib/data/catalog";
import { storeUrl } from "@/lib/routes/urls";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ path: string[] }>;
}

export async function generateStaticParams() {
  const catalog = getCatalog();
  return catalog.storePaths.map((segments) => ({
    path: segments.slice(1),
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { path } = await params;
  const fullPath = `/store/${path.join("/")}`;
  return buildPageMetadata({
    title: `Store: ${path.join(" › ")}`,
    description: `Browse products in ${path.join(" / ")} — deep nested store navigation.`,
    path: fullPath,
  });
}

export default async function StorePage({ params }: PageProps) {
  const { path } = await params;
  if (!path.length) notFound();

  const products = getProductsForStorePath(path);
  const catalog = getCatalog();
  const relatedPaths = catalog.storePaths
    .filter((p) => p.slice(1, -1).join("/") === path.slice(0, -1).join("/"))
    .slice(0, 8);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...path.map((seg, i) => ({
      label: seg,
      href: i < path.length - 1 ? storeUrl(path.slice(0, i + 1)) : undefined,
    })),
  ];

  return (
    <div className="container">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="display-6 fw-bold text-capitalize">{path.join(" / ")}</h1>
      <p className="text-muted mb-4">
        Deep store path with {products.length} products — designed for crawler and analytics path
        testing.
      </p>
      <ProductGrid products={products} />
      {relatedPaths.length > 0 && (
        <section className="mt-5">
          <h2 className="h6 text-muted text-uppercase">Related store paths</h2>
          <ul className="list-unstyled">
            {relatedPaths.map((p) => (
              <li key={p.join("/")}>
                <Link href={storeUrl(p.slice(1))}>{p.slice(1).join(" / ")}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
