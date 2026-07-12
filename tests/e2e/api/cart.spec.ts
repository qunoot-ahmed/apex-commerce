import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { expectedCartTotals } from "../../support/assertions/business";
import {
  CartApiClient,
  parseCartError,
  parseCartState,
} from "../../support/clients/cart-api";

function expectJsonContent(response: { headers: () => Record<string, string> }) {
  expect(response.headers()["content-type"]).toContain("application/json");
}

test.describe("@api cart API", () => {
  const discounted = catalogFixtures.discountedProduct;
  const fullPrice = catalogFixtures.fullPriceProduct;

  test("GET returns an empty cart with JSON content type", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.getCart();
    const state = await parseCartState(response);

    expect(response.status()).toBe(200);
    expectJsonContent(response);
    expect(state.items).toEqual([]);
    expect(state.totals).toEqual(expectedCartTotals([]));
    expect(state.updatedAt).toEqual(expect.any(String));
  });

  test("GET validates item query payload and calculates totals", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.getCart([{ productId: discounted.id, quantity: 2 }]);
    const state = await parseCartState(response);
    const expectedItem = cartLineFromProduct(discounted, 2);

    expect(response.status()).toBe(200);
    expect(state.items).toMatchObject([expectedItem]);
    expect(state.totals).toEqual(expectedCartTotals([expectedItem]));
    expect(state.warnings ?? []).toEqual([]);
  });

  test("POST add accepts a valid product and returns essential cart shape", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.addProduct({ productId: discounted.id });
    const state = await parseCartState(response);
    const expectedItem = cartLineFromProduct(discounted);

    expect(response.status()).toBe(200);
    expectJsonContent(response);
    expect(state.items).toMatchObject([expectedItem]);
    expect(state.totals).toEqual(expectedCartTotals([expectedItem]));
  });

  test("POST add rejects an invalid product", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.addProduct({ productId: "missing-product-id" });
    const error = await parseCartError(response);

    expect(response.status()).toBe(404);
    expect(error.error).toBe("Product not found.");
  });

  test("POST returns a clear error for an unknown action", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.unknownAction();
    const error = await parseCartError(response);

    expect(response.status()).toBe(400);
    expect(error.error).toBe("Unknown action.");
  });

  test("POST calculate ignores zero and negative quantities with warnings", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.calculate([
      { productId: discounted.id, quantity: 0 },
      { productId: fullPrice.id, quantity: -1 },
    ]);
    const state = await parseCartState(response);

    expect(response.status()).toBe(200);
    expect(state.items).toEqual([]);
    expect(state.totals).toEqual(expectedCartTotals([]));
    expect(state.warnings).toEqual(["Invalid cart line item.", "Invalid cart line item."]);
  });

  test("POST add with zero or negative quantity leaves the cart unchanged", async ({ request }) => {
    const api = new CartApiClient(request);

    for (const quantity of [0, -3]) {
      const response = await api.addProduct({ productId: discounted.id, quantity });
      const state = await parseCartState(response);

      expect(response.status()).toBe(200);
      expect(state.items).toEqual([]);
      expect(state.totals).toEqual(expectedCartTotals([]));
    }
  });

  test("POST add caps excessive duplicate quantity to available stock", async ({ request }) => {
    const api = new CartApiClient(request);
    const first = await api.addProduct({
      productId: discounted.id,
      quantity: discounted.stock - 1,
    });
    const firstState = await parseCartState(first);

    const duplicate = await api.addProduct({
      productId: discounted.id,
      quantity: 5,
      items: firstState.items,
    });
    const duplicateState = await parseCartState(duplicate);
    const expectedItem = cartLineFromProduct(discounted, discounted.stock);

    expect(duplicate.status()).toBe(200);
    expect(duplicateState.items).toHaveLength(1);
    expect(duplicateState.items[0]).toMatchObject({ ...expectedItem });
    expect(duplicateState.totals).toEqual(expectedCartTotals([expectedItem]));
  });

  test("PUT validates malformed item lists and caps quantity to stock", async ({ request }) => {
    const api = new CartApiClient(request);
    const response = await api.replace([
      { productId: discounted.id, quantity: discounted.stock + 100 },
      { productId: "unknown-id", quantity: 1 },
    ]);
    const state = await parseCartState(response);
    const expectedItem = cartLineFromProduct(discounted, discounted.stock);

    expect(response.status()).toBe(200);
    expect(state.items).toMatchObject([expectedItem]);
    expect(state.totals).toEqual(expectedCartTotals([expectedItem]));
    expect(state.warnings).toEqual([
      `Only ${discounted.stock} of ${discounted.name} available.`,
      "Product unknown-id not found.",
    ]);
  });

  test("POST update changes quantity and preserves total formulas", async ({ request }) => {
    const api = new CartApiClient(request);
    const item = cartLineFromProduct(fullPrice);
    const response = await api.updateProduct({
      productId: fullPrice.id,
      quantity: 3,
      items: [item],
    });
    const state = await parseCartState(response);
    const expectedItem = cartLineFromProduct(fullPrice, 3);

    expect(response.status()).toBe(200);
    expect(state.items).toMatchObject([expectedItem]);
    expect(state.totals).toEqual(expectedCartTotals([expectedItem]));
  });

  test("malformed JSON payload returns a bad request response", async ({ request }) => {
    const response = await request.fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const error = await parseCartError(response);

    expect(response.status()).toBe(400);
    expect(error.error).toBe("Invalid request.");
  });
});
