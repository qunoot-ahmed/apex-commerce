import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME } from "@/lib/constants";

export const metadata = buildPageMetadata({
  title: "About Us",
  description: `Learn about ${SITE_NAME} — enterprise ecommerce built for scale, SEO, and discovery.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="container col-lg-8">
      <h1 className="display-6 fw-bold mb-4">About {SITE_NAME}</h1>
      <p className="lead">
        Apex Commerce is a production-grade reference storefront designed for large-scale URL
        discovery, SEO validation, analytics testing, and performance benchmarking.
      </p>
      <p>
        Our catalog includes 500+ products, deep category hierarchies, editorial content, and
        comprehensive internal linking — all discoverable from the crawler test hub and HTML
        sitemap.
      </p>
    </div>
  );
}
