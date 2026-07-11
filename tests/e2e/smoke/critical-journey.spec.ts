import { test, expect } from "../../support/fixtures/test";
import { expectNoCriticalBrowserErrors } from "../../support/assertions/diagnostics";
import { expectVisibleImagesLoaded } from "../../support/assertions/images";
import { HomePage } from "../../support/pages/home-page";
import { ProductDetailPage } from "../../support/pages/product-detail-page";
import { ProductListPage } from "../../support/pages/product-list-page";

test.describe("@smoke deployment-critical customer journey", () => {
  test("loads the homepage and primary navigation opens the product catalog", async ({
    page,
    criticalConsoleMessages,
    failedCriticalResponses,
  }) => {
    const homePage = new HomePage(page);

    await homePage.goto();
    await expect(page.getByRole("link", { name: "Shop All" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured Products" })).toBeVisible();
    await expectVisibleImagesLoaded(page);

    await homePage.openProductsFromPrimaryNavigation();

    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
    await expect(page.locator("article.product-card")).not.toHaveCount(0);
    await expectNoCriticalBrowserErrors(criticalConsoleMessages, failedCriticalResponses);
  });

  test("search returns results and a product can be added to the cart", async ({
    page,
    criticalConsoleMessages,
    failedCriticalResponses,
  }) => {
    const homePage = new HomePage(page);
    const productListPage = new ProductListPage(page);
    const productDetailPage = new ProductDetailPage(page);

    await homePage.goto();
    await homePage.search("laptop");

    await expect(page).toHaveURL(/\/search\?q=laptop/);
    await expect(page.getByRole("heading", { name: 'Results for "laptop"' })).toBeVisible();
    await expect(page.locator("article.product-card")).not.toHaveCount(0);

    const productName = await productListPage.openFirstProduct();
    await productDetailPage.addCurrentProductToCart();
    await productDetailPage.openCartFromHeader();

    await expect(page.getByRole("link", { name: productName, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Order Summary" })).toBeVisible();
    await expect(page.getByText("Subtotal").first()).toBeVisible();
    await expect(page.getByText("Tax (8%)")).toBeVisible();
    await expect(page.getByRole("link", { name: "Proceed to Checkout" })).toBeVisible();
    await expectNoCriticalBrowserErrors(criticalConsoleMessages, failedCriticalResponses);
  });
});
