import { NextResponse } from "next/server";
import {
  buildCartState,
  mergeCartItem,
  getProductById,
  updateItemQuantity,
  validateCartItems,
} from "@/lib/cart/cart-service";
import type { CartLineItem } from "@/types/cart";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const payload = searchParams.get("items");
    if (!payload) {
      return NextResponse.json(buildCartState([]));
    }
    const parsed = JSON.parse(payload) as { productId: string; quantity: number }[];
    const { items, errors } = validateCartItems(parsed);
    const state = buildCartState(items);
    return NextResponse.json({ ...state, warnings: errors });
  } catch {
    return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === "add") {
      const product = getProductById(body.productId);
      if (!product) {
        return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      if (product.stock <= 0) {
        return NextResponse.json({ error: "Product is out of stock." }, { status: 400 });
      }
      const existing = (body.items ?? []) as CartLineItem[];
      const items = mergeCartItem(existing, product, body.quantity ?? 1);
      return NextResponse.json(buildCartState(items));
    }

    if (action === "update") {
      const existing = (body.items ?? []) as CartLineItem[];
      const items = updateItemQuantity(existing, body.productId, body.quantity);
      return NextResponse.json(buildCartState(items));
    }

    if (action === "remove") {
      const existing = (body.items ?? []) as CartLineItem[];
      const items = existing.filter((i) => i.productId !== body.productId);
      return NextResponse.json(buildCartState(items));
    }

    if (action === "calculate") {
      const { items, errors } = validateCartItems(body.items ?? []);
      return NextResponse.json({ ...buildCartState(items), warnings: errors });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items, errors } = validateCartItems(body.items ?? []);

    return NextResponse.json({
      ...buildCartState(items),
      warnings: errors,
    });
  } catch {
    return NextResponse.json({ error: "Invalid cart payload." }, { status: 400 });
  }
}
