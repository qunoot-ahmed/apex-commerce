import { test, expect } from "../../support/fixtures/test";
import { expectVisibleImagesLoaded } from "../../support/assertions/images";
import {
  discountedProducts,
  productsForBrand,
  productsForCategory,
  catalogFixtures,
} from "../../support/catalog-fixtures";
import { formatCurrency, round2 } from "../../support/assertions/business";
import type { Product } from "../../../src/types/catalog";

function productCard(page: import("@playwright/test").Page, product: Product) {
  return page.getByRole("article", { name: `Product: ${product.name}` });
}

test.describe("@regression @catalog product catalog validation", () => {
  test.describe.configure({ mode: "serial" });

  test("product cards expose core merchandising data and pricing rules", async ({ page }) => {
    const discounted = catalogFixtures.discountedProduct;
    const fullPrice = catalogFixtures.fullPriceProduct;

    await page.goto(`/products?brand=${discounted.brandSlug}`);

    const discountedCard = productCard(page, discounted);
    await expect(discountedCard.getByRole("heading", { name: discounted.name })).toBeVisible();
    await expect(discountedCard.getByRole("img", { name: discounted.image.alt })).toBeVisible();
    await expect(discountedCard.getByText(discounted.brandSlug, { exact: true })).toBeVisible();
    await expect(
      discountedCard.getByRole("img", { name: `Rating: ${discounted.rating} out of 5` })
    ).toBeVisible();
    await expect(discountedCard.getByText(`(${discounted.reviewCount})`)).toBeVisible();
    await expect(discountedCard).toContainText(
      formatCurrency(round2(discounted.price * (1 - discounted.discountPercent / 100)))
    );
    await expect(discountedCard).toContainText(formatCurrency(discounted.price));
    await expect(discountedCard.getByText(`-${discounted.discountPercent}%`)).toBeVisible();

    await page.goto(`/products?brand=${fullPrice.brandSlug}`);

    const fullPriceCard = productCard(page, fullPrice);
    await expect(fullPriceCard.getByRole("heading", { name: fullPrice.name })).toBeVisible();
    await expect(fullPriceCard).toContainText(formatCurrency(fullPrice.price));
    await expect(fullPriceCard.getByText(/-\d+%/)).toHaveCount(0);
    await expect(fullPriceCard.getByText(formatCurrency(fullPrice.price))).toHaveCount(1);
  });

  test("listing information matches the product detail page and URL slug", async ({ page }) => {
    const product = catalogFixtures.discountedProduct;
    const expectedSalePrice = formatCurrency(
      round2(product.price * (1 - product.discountPercent / 100))
    );

    await page.goto(`/products?brand=${product.brandSlug}`);
    const card = productCard(page, product);

    await expect(card).toContainText(product.name);
    await expect(card).toContainText(expectedSalePrice);
    await card.getByRole("link", { name: `View details for ${product.name}` }).click();

    await expect(page).toHaveURL(new RegExp(`/product/${product.slug}$`));
    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
    await expect(page.getByText(`SKU ${product.sku}`)).toBeVisible();
    await expect(page.getByText(`${product.stock} available`)).toBeVisible();
    await expect(page.getByText(expectedSalePrice)).toBeVisible();
    await expect(page.getByText(formatCurrency(product.price))).toBeVisible();
  });

  test("invalid product slug returns the intended 404 page", async ({ page }) => {
    const response = await page.goto("/product/not-a-real-apex-product");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

  test("category page shows category-appropriate products", async ({ page }) => {
    const categoryPath = catalogFixtures.laptopProduct.categoryPath.join("/");
    const categoryProducts = productsForCategory(categoryPath).slice(0, 3);

    await page.goto(`/category/${categoryPath}`);
    await expect(page.getByRole("heading", { name: catalogFixtures.laptopProduct.categoryPath.at(-1)! })).toBeVisible();
    for (const product of categoryProducts) {
      await expect(productCard(page, product)).toBeVisible();
    }
  });

  test("brand page shows products from the selected brand", async ({ page }) => {
    const brandProducts = productsForBrand(catalogFixtures.laptopProduct.brandSlug).slice(0, 3);

    await page.goto(`/brand/${catalogFixtures.laptopProduct.brandSlug}`);
    for (const product of brandProducts) {
      await expect(productCard(page, product)).toBeVisible();
    }
  });

  test("deals page shows products with valid discounts", async ({ page }) => {
    const dealsProducts = discountedProducts().slice(0, 3);

    await page.goto("/deals");
    await expect(page.getByRole("heading", { name: "Today's Deals" })).toBeVisible();
    for (const product of dealsProducts) {
      const card = productCard(page, product);
      await expect(card).toBeVisible();
      await expect(card.getByText(`-${product.discountPercent}%`)).toBeVisible();
    }
  });

  test("representative product images load successfully", async ({ page }) => {
    await page.goto(`/product/${catalogFixtures.laptopProduct.slug}`);

    await expect(page.getByRole("heading", { name: catalogFixtures.laptopProduct.name })).toBeVisible();
    await expectVisibleImagesLoaded(page);
  });
});
