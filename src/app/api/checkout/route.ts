import { NextResponse } from "next/server";
import {
  buildCartState,
  generateOrderNumber,
  validateCartItems,
} from "@/lib/cart/cart-service";
import type { CheckoutRequest } from "@/types/cart";

function validateAddress(address: CheckoutRequest["address"]): string[] {
  const errors: string[] = [];
  if (!address.firstName?.trim()) errors.push("First name is required.");
  if (!address.lastName?.trim()) errors.push("Last name is required.");
  if (!address.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) {
    errors.push("Valid email is required.");
  }
  if (!address.phone?.trim()) errors.push("Phone is required.");
  if (!address.address1?.trim()) errors.push("Address is required.");
  if (!address.city?.trim()) errors.push("City is required.");
  if (!address.state?.trim()) errors.push("State is required.");
  if (!address.zip?.trim()) errors.push("ZIP code is required.");
  return errors;
}

export async function GET() {
  return NextResponse.json({
    paymentMethods: [
      { id: "card", label: "Credit / Debit Card" },
      { id: "paypal", label: "PayPal" },
    ],
    taxRate: 0.08,
    freeShippingThreshold: 75,
    message: "Checkout API is available. Use POST to place an order or PUT to validate totals.",
  });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Pick<CheckoutRequest, "items">;
    const { items, errors } = validateCartItems(body.items ?? []);
    const cart = buildCartState(items);

    return NextResponse.json({
      ...cart,
      warnings: errors,
      valid: items.length > 0 && errors.length === 0,
    });
  } catch {
    return NextResponse.json({ error: "Checkout validation failed." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;

    if (!body.items?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const addressErrors = validateAddress(body.address ?? ({} as CheckoutRequest["address"]));
    if (addressErrors.length) {
      return NextResponse.json({ error: "Validation failed.", details: addressErrors }, { status: 400 });
    }

    const { items, errors } = validateCartItems(body.items);
    if (!items.length) {
      return NextResponse.json(
        { error: "No valid items in cart.", details: errors },
        { status: 400 }
      );
    }

    const cart = buildCartState(items);
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + (cart.totals.freeShippingEligible ? 3 : 5));

    const response = {
      orderId: `ord_${Date.now()}`,
      orderNumber: generateOrderNumber(),
      totals: cart.totals,
      estimatedDelivery: delivery.toISOString().split("T")[0],
      message: `Order placed successfully. ${items.length} item(s) totaling $${cart.totals.total.toFixed(2)}.`,
      warnings: errors,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}
