import type { APIRequestContext } from "@playwright/test";
import type { CartLineItem, CartState } from "../../../src/types/cart";

export type CartLineInput = Pick<CartLineItem, "productId" | "quantity">;
export type CartApiState = CartState & { warnings?: string[] };
export type CartApiError = { error: string; details?: string[] };

export class CartApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getCart(items?: CartLineInput[]) {
    const query = items ? `?items=${encodeURIComponent(JSON.stringify(items))}` : "";
    return this.request.get(`/api/cart${query}`);
  }

  async addProduct(params: {
    productId: string;
    quantity?: number;
    items?: CartLineItem[];
  }) {
    return this.request.post("/api/cart", {
      data: {
        action: "add",
        productId: params.productId,
        quantity: params.quantity ?? 1,
        items: params.items ?? [],
      },
    });
  }

  async updateProduct(params: {
    productId: string;
    quantity: number;
    items: CartLineItem[];
  }) {
    return this.request.post("/api/cart", {
      data: {
        action: "update",
        productId: params.productId,
        quantity: params.quantity,
        items: params.items,
      },
    });
  }

  async calculate(items: CartLineInput[] | CartLineItem[]) {
    return this.request.post("/api/cart", {
      data: { action: "calculate", items },
    });
  }

  async replace(items: CartLineInput[] | CartLineItem[]) {
    return this.request.put("/api/cart", { data: { items } });
  }

  async unknownAction() {
    return this.request.post("/api/cart", {
      data: { action: "not-supported" },
    });
  }
}

export async function parseCartState(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CartApiState;
}

export async function parseCartError(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CartApiError;
}
