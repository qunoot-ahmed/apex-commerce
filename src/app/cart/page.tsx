import { CartView } from "@/components/cart/CartView";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Shopping Cart",
  description: "Review items in your cart.",
  path: "/cart",
});

export default function CartPage() {
  return <CartView />;
}
