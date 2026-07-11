import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { OG_DEFAULT_IMAGE } from "@/lib/images/catalog-images";
import { absoluteUrl, productUrl } from "@/lib/routes/urls";
import type { BlogPost, Product } from "@/types/catalog";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(OG_DEFAULT_IMAGE),
    sameAs: [
      "https://twitter.com/apexcommerce",
      "https://www.facebook.com/apexcommerce",
      "https://www.instagram.com/apexcommerce",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-555-0199",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: Product) {
  const price = product.price * (1 - product.discountPercent / 100);
  const images = [product.image.src, ...product.images.filter((image) => image !== product.image.src)].map((image) =>
    image.startsWith("http") ? image : absoluteUrl(image)
  );

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brandSlug,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productUrl(product.slug)),
      priceCurrency: "USD",
      price: price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function articleSchema(post: BlogPost) {
  const image = post.imageUrl.startsWith("http")
    ? post.imageUrl
    : absoluteUrl(post.imageUrl);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(OG_DEFAULT_IMAGE),
      },
    },
  };
}
