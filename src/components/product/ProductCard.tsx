"use client";

import Link from "next/link";
import Rating from "@mui/material/Rating";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { CatalogImage } from "@/components/ui/CatalogImage";
import { productUrl } from "@/lib/routes/urls";
import { effectivePrice, formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const salePrice = effectivePrice(product.price, product.discountPercent);

  return (
    <article className="product-card card h-100 border-0 shadow-sm apex-animate-in">
      <div className="product-card-image position-relative overflow-hidden">
        <Link href={productUrl(product.slug)} className="text-decoration-none text-body">
          <CatalogImage
            src={product.image.src}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            className="card-img-top object-fit-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        {product.discountPercent > 0 && (
          <span className="badge bg-danger position-absolute top-0 start-0 m-2">
            -{product.discountPercent}%
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <Link href={productUrl(product.slug)} className="text-decoration-none text-body">
          <p className="text-muted small mb-1 text-uppercase">{product.brandSlug}</p>
          <h3 className="h6 card-title mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        <div className="d-flex align-items-center gap-1 mb-2">
          <Rating value={product.rating} precision={0.1} readOnly size="small" />
          <span className="small text-muted">({product.reviewCount})</span>
        </div>
        <div className="d-flex align-items-baseline gap-2 mb-3">
          <span className="fw-bold fs-5">{formatPrice(salePrice)}</span>
          {product.discountPercent > 0 && (
            <span className="text-muted text-decoration-line-through small">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <AddToCartButton
            product={product}
            className="btn btn-dark btn-sm w-100"
            showBuyNow={false}
          />
        </div>
      </div>
    </article>
  );
}
