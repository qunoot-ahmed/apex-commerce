import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Checkout",
  description: "Complete your Apex Commerce order.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return <CheckoutForm />;
}
