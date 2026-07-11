"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { cartUrl } from "@/lib/routes/urls";
import type { Product } from "@/types/catalog";

export function AddToCartButton({
  product,
  className = "btn btn-dark btn-lg px-5",
  showBuyNow = true,
}: {
  product: Product;
  className?: string;
  showBuyNow?: boolean;
}) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "added">("idle");

  async function handleAdd(goToCart = false) {
    if (product.stock <= 0) return;
    setStatus("loading");
    try {
      await addToCart(product, 1);
      setStatus("added");
      if (goToCart) router.push(cartUrl());
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("idle");
    }
  }

  const disabled = product.stock <= 0 || status === "loading";

  return (
    <div className="add-to-cart-actions d-flex flex-wrap gap-2">
      <button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => handleAdd(false)}
      >
        {product.stock <= 0
          ? "Out of Stock"
          : status === "loading"
            ? "Adding..."
            : status === "added"
              ? "Added"
              : "Add to Cart"}
      </button>
      {showBuyNow && (
        <button
          type="button"
          className="btn btn-outline-dark btn-lg"
          disabled={disabled}
          onClick={() => handleAdd(true)}
        >
          Buy Now
        </button>
      )}
    </div>
  );
}
