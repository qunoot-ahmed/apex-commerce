export interface CartLineItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  sku: string;
  price: number;
  discountPercent: number;
  quantity: number;
  stock: number;
}

export interface CartTotals {
  itemCount: number;
  lineCount: number;
  subtotal: number;
  savings: number;
  shipping: number;
  tax: number;
  total: number;
  freeShippingEligible: boolean;
  amountUntilFreeShipping: number;
}

export interface CartState {
  items: CartLineItem[];
  totals: CartTotals;
  updatedAt: string;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CheckoutRequest {
  items: { productId: string; quantity: number }[];
  address: CheckoutAddress;
  paymentMethod: "card" | "paypal";
}

export interface CheckoutResponse {
  orderId: string;
  orderNumber: string;
  totals: CartTotals;
  estimatedDelivery: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}
