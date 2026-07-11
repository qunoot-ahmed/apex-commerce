"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/images/catalog-images";

type CatalogImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

export function CatalogImage({ src, alt, ...props }: CatalogImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      unoptimized
      onError={() => {
        if (imgSrc !== FALLBACK_PRODUCT_IMAGE) setImgSrc(FALLBACK_PRODUCT_IMAGE);
      }}
    />
  );
}
