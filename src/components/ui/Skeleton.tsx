"use client";

import Skeleton from "@mui/material/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton p-3">
      <Skeleton variant="rounded" height={220} animation="wave" />
      <Skeleton className="mt-3" width="80%" animation="wave" />
      <Skeleton width="40%" animation="wave" />
      <Skeleton width="60%" height={32} className="mt-2" animation="wave" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton width={280} height={40} animation="wave" />
      <Skeleton width={480} animation="wave" />
    </div>
  );
}
