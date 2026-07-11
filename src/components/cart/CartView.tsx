"use client";

import Link from "next/link";
import { CatalogImage } from "@/components/ui/CatalogImage";
import { useCart } from "@/components/providers/CartProvider";
import { lineUnitPrice, lineTotal } from "@/lib/cart/calculations";
import { formatPrice } from "@/lib/utils/format";
import { checkoutUrl, productUrl, productsUrl } from "@/lib/routes/urls";

export function CartView() {
  const { items, totals, updateQuantity, removeFromCart, isLoading } = useCart();

  if (isLoading) {
    return <div className="container py-5 text-center text-muted">Loading cart...</div>;
  }

  if (!items.length) {
    return (
      <div className="container text-center py-5">
        <h1 className="display-6 fw-bold mb-3">Your Cart</h1>
        <p className="text-muted mb-4">Your cart is empty. Discover products across our catalog.</p>
        <Link href={productsUrl()} className="btn btn-dark btn-lg">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="display-6 fw-bold mb-4">Your Cart ({totals.itemCount} items)</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          {items.map((item) => (
            <div key={item.productId} className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="row align-items-center g-3 cart-line-row">
                  <div className="col-4 col-sm-auto">
                    <Link href={productUrl(item.slug)}>
                      <CatalogImage
                        src={item.image}
                        alt={item.imageAlt}
                        width={96}
                        height={96}
                        className="cart-line-image rounded object-fit-cover"
                      />
                    </Link>
                  </div>
                  <div className="col-8 col-sm">
                    <Link
                      href={productUrl(item.slug)}
                      className="fw-semibold text-decoration-none text-body"
                    >
                      {item.name}
                    </Link>
                    <p className="small text-muted mb-0">SKU: {item.sku}</p>
                    <p className="mb-0">
                      {formatPrice(lineUnitPrice(item))}
                      {item.discountPercent > 0 && (
                        <span className="text-muted text-decoration-line-through ms-2 small">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-6 col-sm-auto">
                    <div className="input-group" style={{ width: 120 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="form-control text-center"
                        value={item.quantity}
                        readOnly
                        aria-label="Quantity"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="col-6 col-sm-auto fw-bold text-end text-sm-start">
                    {formatPrice(lineTotal(item))}
                  </div>
                  <div className="col-12 col-sm-auto">
                    <button
                      type="button"
                      className="btn btn-link text-danger text-decoration-none p-0 p-sm-2"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: 100 }}>
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Order Summary</h2>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.savings > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Savings</span>
                  <span>-{formatPrice(totals.savings)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>
                  {totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (8%)</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>Total</span>
                <span>{formatPrice(totals.total)}</span>
              </div>
              {!totals.freeShippingEligible && (
                <p className="small text-muted">
                  Add {formatPrice(totals.amountUntilFreeShipping)} more for free shipping.
                </p>
              )}
              <Link href={checkoutUrl()} className="btn btn-dark w-100 btn-lg">
                Proceed to Checkout
              </Link>
              <Link href={productsUrl()} className="btn btn-link w-100 mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
