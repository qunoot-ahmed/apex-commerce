import type { APIRequestContext } from "@playwright/test";
import type {
  CartLineItem,
  CartTotals,
  CheckoutAddress,
} from "../../../src/types/cart";

export type CheckoutLineInput = Pick<CartLineItem, "productId" | "quantity">;

export type CheckoutConfig = {
  paymentMethods: { id: string; label: string }[];
  taxRate: number;
  freeShippingThreshold: number;
  message: string;
};

export type CheckoutValidation = {
  items: CartLineItem[];
  totals: CartTotals;
  updatedAt: string;
  warnings?: string[];
  valid: boolean;
};

export type CheckoutSuccess = {
  orderId: string;
  orderNumber: string;
  totals: CartTotals;
  estimatedDelivery: string;
  message: string;
  warnings?: string[];
};

export type CheckoutApiError = { error: string; details?: string[] };

export const validCheckoutAddress: CheckoutAddress = {
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex.taylor@example.com",
  phone: "555-0100",
  address1: "123 Market Street",
  address2: "",
  city: "Austin",
  state: "TX",
  zip: "78701",
  country: "US",
};

export class CheckoutApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getConfig() {
    return this.request.get("/api/checkout");
  }

  async validate(items: CheckoutLineInput[] | CartLineItem[]) {
    return this.request.put("/api/checkout", { data: { items } });
  }

  async placeOrder(params: {
    items: CheckoutLineInput[] | CartLineItem[];
    address?: Partial<CheckoutAddress>;
    paymentMethod?: "card" | "paypal";
  }) {
    return this.request.post("/api/checkout", {
      data: {
        items: params.items,
        address: { ...validCheckoutAddress, ...params.address },
        paymentMethod: params.paymentMethod ?? "card",
      },
    });
  }
}

export async function parseCheckoutConfig(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CheckoutConfig;
}

export async function parseCheckoutValidation(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CheckoutValidation;
}

export async function parseCheckoutSuccess(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CheckoutSuccess;
}

export async function parseCheckoutError(response: { json: () => Promise<unknown> }) {
  return (await response.json()) as CheckoutApiError;
}
