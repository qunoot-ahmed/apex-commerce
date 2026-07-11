import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Order Confirmed",
  description: "Your Apex Commerce order has been placed.",
  path: "/checkout/success",
});

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">Loading...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
