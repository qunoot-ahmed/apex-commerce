"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils/format";
import { cartUrl, productsUrl } from "@/lib/routes/urls";
import type { CheckoutAddress, CheckoutResponse } from "@/types/cart";

const EMPTY_ADDRESS: CheckoutAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

export function CheckoutForm() {
  const { items, totals, clearCart, isLoading } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState<CheckoutAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="container py-5 text-center text-muted">Loading...</div>;
  }

  if (!items.length) {
    return (
      <div className="container py-5 text-center">
        <h1 className="display-6 fw-bold mb-3">Checkout</h1>
        <p className="text-muted mb-4">Your cart is empty.</p>
        <Link href={productsUrl()} className="btn btn-dark">
          Shop Products
        </Link>
      </div>
    );
  }

  function updateField<K extends keyof CheckoutAddress>(key: K, value: CheckoutAddress[K]) {
    setAddress((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.details?.join(" ") ?? data.error ?? "Checkout failed.");
        return;
      }

      const order = data as CheckoutResponse;
      clearCart();
      sessionStorage.setItem("apex-last-order", JSON.stringify(order));
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch {
      setError("Unable to complete checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-4">
      <h1 className="display-6 fw-bold mb-4">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3">Shipping Address</h2>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input
                      className="form-control"
                      required
                      value={address.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last name</label>
                    <input
                      className="form-control"
                      required
                      value={address.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={address.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      required
                      value={address.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input
                      className="form-control"
                      required
                      value={address.address1}
                      onChange={(e) => updateField("address1", e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Apartment, suite, etc. (optional)</label>
                    <input
                      className="form-control"
                      value={address.address2}
                      onChange={(e) => updateField("address2", e.target.value)}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">City</label>
                    <input
                      className="form-control"
                      required
                      value={address.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input
                      className="form-control"
                      required
                      value={address.state}
                      onChange={(e) => updateField("state", e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">ZIP</label>
                    <input
                      className="form-control"
                      required
                      value={address.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3">Payment</h2>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="payment"
                    id="pay-card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <label className="form-check-label" htmlFor="pay-card">
                    Credit / Debit Card
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="payment"
                    id="pay-paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />
                  <label className="form-check-label" htmlFor="pay-paypal">
                    PayPal
                  </label>
                </div>
                <p className="small text-muted mt-3 mb-0">
                  Demo checkout - no real payment is processed.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: 100 }}>
              <div className="card-body">
                <h2 className="h5 fw-bold mb-3">Order Summary</h2>
                <ul className="list-unstyled mb-3">
                  {items.map((item) => (
                    <li key={item.productId} className="d-flex justify-content-between small mb-2">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>{totals.shipping === 0 ? "FREE" : formatPrice(totals.shipping)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <span>{formatPrice(totals.tax)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <button
                  type="submit"
                  className="btn btn-dark w-100 btn-lg"
                  disabled={submitting}
                >
                  {submitting ? "Placing Order..." : `Place Order - ${formatPrice(totals.total)}`}
                </button>
                <Link href={cartUrl()} className="btn btn-link w-100 mt-2">
                  Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
