import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures, cartLineFromProduct } from "../../support/catalog-fixtures";
import { checkoutSummary, expectSummaryTotals, seedCart } from "../../support/cart-ui";

const validAddress = {
  firstName: "Alex",
  lastName: "Taylor",
  email: "alex.taylor@example.com",
  phone: "555-0100",
  address: "123 Market Street",
  city: "Austin",
  state: "TX",
  zip: "78701",
};

async function fillCheckoutForm(page: import("@playwright/test").Page, overrides = {}) {
  const address = { ...validAddress, ...overrides };

  await page.getByLabel("First name").fill(address.firstName);
  await page.getByLabel("Last name").fill(address.lastName);
  await page.getByLabel("Email").fill(address.email);
  await page.getByLabel("Phone").fill(address.phone);
  await page.getByLabel("Address", { exact: true }).fill(address.address);
  await page.getByLabel("City").fill(address.city);
  await page.getByLabel("State").fill(address.state);
  await page.getByLabel("ZIP").fill(address.zip);
}

test.describe("@regression @checkout checkout validation", () => {
  const item = cartLineFromProduct(catalogFixtures.discountedProduct, 2);

  test("empty checkout state sends shoppers back to products", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop Products" })).toBeVisible();
  });

  test("required-field and invalid-email validation block submission", async ({ page }) => {
    await seedCart(page, [item]);
    await page.goto("/checkout");

    await page.getByRole("button", { name: /Place Order/ }).click();
    await expect(page.getByLabel("First name")).toBeFocused();

    await fillCheckoutForm(page, { email: "not-an-email" });
    await page.getByRole("button", { name: /Place Order/ }).click();

    await expect
      .poll(async () =>
        page.getByLabel("Email").evaluate((input) => (input as HTMLInputElement).validationMessage)
      )
      .not.toBe("");
  });

  test("order summary matches cart formulas before checkout", async ({ page }) => {
    await seedCart(page, [item]);
    await page.goto("/checkout");
    const summary = checkoutSummary(page);

    await expect(summary.getByText(`${item.name} x ${item.quantity}`, { exact: true })).toBeVisible();
    await expectSummaryTotals(summary, [item]);
    await expect(page.getByText("Demo checkout - no real payment is processed.")).toBeVisible();
  });

  test("successful simulated checkout confirms order and clears the cart", async ({ page }) => {
    await seedCart(page, [item]);
    await page.goto("/checkout");
    await fillCheckoutForm(page);

    const checkoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/checkout") && response.request().method() === "POST"
    );
    await page.getByRole("button", { name: /Place Order/ }).click();
    expect((await checkoutResponse).status()).toBe(201);

    await expect(page).toHaveURL(/\/checkout\/success\?order=APEX-/);
    await expect(page.getByRole("heading", { name: "Order Confirmed!" })).toBeVisible();
    await expect(page.getByText(/Order number: APEX-/)).toBeVisible();
    await expect(page.getByText(/Total paid:/)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("apex-cart"))).toBeNull();
  });

  test("direct success access without an order does not show confirmation", async ({ page }) => {
    await page.goto("/checkout/success");

    await expect(page.getByRole("heading", { name: "No order found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to Cart" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Order Confirmed!" })).toHaveCount(0);
  });

  test("checkout API failure is surfaced without claiming payment-provider coverage", async ({ page }) => {
    await seedCart(page, [item]);
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Checkout service unavailable." }),
      });
    });
    await page.goto("/checkout");
    await fillCheckoutForm(page);

    await page.getByRole("button", { name: /Place Order/ }).click();

    await expect(page.getByText("Checkout service unavailable.", { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
  });
});
