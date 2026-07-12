"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import { cartUrl, productsUrl } from "@/lib/routes/urls";
import type { CheckoutResponse } from "@/types/cart";

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order] = useState<CheckoutResponse | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("apex-last-order");
    if (raw) {
      try {
        return JSON.parse(raw) as CheckoutResponse;
      } catch {
        return null;
      }
    }
    return null;
  });

  if (!order || !orderNumber || order.orderNumber !== orderNumber) {
    return (
      <div className="container py-5 text-center col-lg-6">
        <h1 className="display-6 fw-bold mb-3">No order found</h1>
        <p className="lead text-muted mb-4">
          We could not find a recent checkout confirmation for this browser session.
        </p>
        <Link href={cartUrl()} className="btn btn-dark btn-lg">
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 text-center col-lg-6">
      <div className="mb-4">
        <span className="display-1 text-success">OK</span>
      </div>
      <h1 className="display-6 fw-bold mb-3">Order Confirmed!</h1>
      <p className="lead text-muted mb-4">
        {order?.message ?? "Thank you for your order."}
      </p>
      {orderNumber && (
        <p className="fw-semibold">
          Order number: <span className="text-primary">{orderNumber}</span>
        </p>
      )}
      {order && (
        <div className="card border-0 shadow-sm text-start mb-4">
          <div className="card-body">
            <p className="mb-1">
              <strong>Total paid:</strong> {formatPrice(order.totals.total)}
            </p>
            <p className="mb-1">
              <strong>Estimated delivery:</strong> {order.estimatedDelivery}
            </p>
            <p className="mb-0 small text-muted">
              A confirmation email would be sent in a production environment.
            </p>
          </div>
        </div>
      )}
      <Link href={productsUrl()} className="btn btn-dark btn-lg">
        Continue Shopping
      </Link>
    </div>
  );
}
