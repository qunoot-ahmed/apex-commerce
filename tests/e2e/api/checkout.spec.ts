import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { expectedCartTotals } from "../../support/assertions/business";
import {
  CheckoutApiClient,
  parseCheckoutConfig,
  parseCheckoutError,
  parseCheckoutSuccess,
  parseCheckoutValidation,
} from "../../support/clients/checkout-api";

function expectJsonContent(response: { headers: () => Record<string, string> }) {
  expect(response.headers()["content-type"]).toContain("application/json");
}

test.describe("@api checkout API", () => {
  const product = catalogFixtures.discountedProduct;
  const item = cartLineFromProduct(product, 2);
  const lineInput = { productId: product.id, quantity: 2 };

  test("GET returns checkout configuration", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.getConfig();
    const config = await parseCheckoutConfig(response);

    expect(response.status()).toBe(200);
    expectJsonContent(response);
    expect(config.paymentMethods).toEqual([
      { id: "card", label: "Credit / Debit Card" },
      { id: "paypal", label: "PayPal" },
    ]);
    expect(config.taxRate).toBe(0.08);
    expect(config.freeShippingThreshold).toBe(75);
  });

  test("PUT validates cart totals and validity", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.validate([lineInput]);
    const validation = await parseCheckoutValidation(response);

    expect(response.status()).toBe(200);
    expect(validation.valid).toBe(true);
    expect(validation.items).toMatchObject([item]);
    expect(validation.totals).toEqual(expectedCartTotals([item]));
    expect(validation.warnings ?? []).toEqual([]);
  });

  test("PUT marks empty checkout validation as invalid", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.validate([]);
    const validation = await parseCheckoutValidation(response);

    expect(response.status()).toBe(200);
    expect(validation.valid).toBe(false);
    expect(validation.items).toEqual([]);
    expect(validation.totals).toEqual(expectedCartTotals([]));
  });

  test("POST rejects an empty checkout", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.placeOrder({ items: [] });
    const error = await parseCheckoutError(response);

    expect(response.status()).toBe(400);
    expect(error.error).toBe("Cart is empty.");
  });

  test("POST validates missing shipping address fields", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.placeOrder({
      items: [lineInput],
      address: {
        firstName: "",
        lastName: "",
        phone: "",
        address1: "",
        city: "",
        state: "",
        zip: "",
      },
    });
    const error = await parseCheckoutError(response);

    expect(response.status()).toBe(400);
    expect(error.error).toBe("Validation failed.");
    expect(error.details).toEqual(
      expect.arrayContaining([
        "First name is required.",
        "Last name is required.",
        "Phone is required.",
        "Address is required.",
        "City is required.",
        "State is required.",
        "ZIP code is required.",
      ])
    );
  });

  test("POST validates invalid email", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.placeOrder({
      items: [lineInput],
      address: { email: "not-an-email" },
    });
    const error = await parseCheckoutError(response);

    expect(response.status()).toBe(400);
    expect(error.details).toContain("Valid email is required.");
  });

  test("POST returns simulated order success and consistent totals", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.placeOrder({ items: [lineInput] });
    const order = await parseCheckoutSuccess(response);

    expect(response.status()).toBe(201);
    expectJsonContent(response);
    expect(order.orderId).toMatch(/^ord_/);
    expect(order.orderNumber).toMatch(/^APEX-/);
    expect(order.estimatedDelivery).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(order.totals).toEqual(expectedCartTotals([item]));
    expect(order.message).toContain(`$${order.totals.total.toFixed(2)}`);
  });

  test("POST rejects payloads with no valid cart items", async ({ request }) => {
    const api = new CheckoutApiClient(request);
    const response = await api.placeOrder({
      items: [{ productId: "missing-product", quantity: 1 }],
    });
    const error = await parseCheckoutError(response);

    expect(response.status()).toBe(400);
    expect(error.error).toBe("No valid items in cart.");
    expect(error.details).toContain("Product missing-product not found.");
  });

  test("malformed JSON payload returns checkout failure", async ({ request }) => {
    const response = await request.fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const error = await parseCheckoutError(response);

    expect(response.status()).toBe(500);
    expect(error.error).toBe("Checkout failed.");
  });
});
