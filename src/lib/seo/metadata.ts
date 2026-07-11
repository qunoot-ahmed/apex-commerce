import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { OG_DEFAULT_IMAGE } from "@/lib/images/catalog-images";
import { absoluteUrl } from "@/lib/routes/urls";

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
}

export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = absoluteUrl(input.path);
  const title = input.title.includes(SITE_NAME)
    ? input.title
    : `${input.title} | ${SITE_NAME}`;
  const image = input.image?.startsWith("http")
    ? input.image
    : input.image
      ? absoluteUrl(input.image)
      : absoluteUrl(OG_DEFAULT_IMAGE);

  return {
    title,
    description: input.description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      type: input.type === "article" ? "article" : "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [image],
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function defaultSiteMetadata(): Metadata {
  return buildPageMetadata({
    title: SITE_NAME,
    description: `${SITE_TAGLINE}. Shop fashion, electronics, home, sports, and beauty from 500+ premium brands.`,
    path: "/",
  });
}
