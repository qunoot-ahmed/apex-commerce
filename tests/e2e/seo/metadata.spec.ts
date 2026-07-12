import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures } from "../../support/catalog-fixtures";
import { getCatalog } from "../../../src/lib/data/catalog";
import { formatCurrency, round2 } from "../../support/assertions/business";

async function jsonLdObjects(page: import("@playwright/test").Page) {
  const rawScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return rawScripts.flatMap((raw) => {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [parsed];
  }) as Record<string, unknown>[];
}

async function expectCanonical(page: import("@playwright/test").Page, path: string) {
  const canonical = page.locator('link[rel="canonical"]');
  if (path === "/") {
    await expect(canonical).toHaveAttribute("href", /^https?:\/\/[^/]+\/?$/);
    return;
  }

  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await expect(canonical).toHaveAttribute("href", new RegExp(`${escapedPath}$`));
}

async function expectIndexable(page: import("@playwright/test").Page) {
  const robots = page.locator('meta[name="robots"]');
  await expect(robots).toHaveAttribute("content", /index/);
  await expect(robots).not.toHaveAttribute("content", /noindex/);
}

test.describe("@seo metadata and structured data", () => {
  test("homepage exposes title, canonical, OG metadata, and indexable robots", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Apex Commerce/);
    await expectCanonical(page, "/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Apex Commerce/);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", /^https?:\/\/[^/]+\/?$/);
    await expectIndexable(page);
  });

  test("product metadata and JSON-LD match visible product details", async ({ page }) => {
    const product = catalogFixtures.discountedProduct;
    const expectedPrice = round2(product.price * (1 - product.discountPercent / 100)).toFixed(2);

    await page.goto(`/product/${product.slug}`);

    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      new RegExp(product.name)
    );
    await expectCanonical(page, `/product/${product.slug}`);
    await expectIndexable(page);

    const objects = await jsonLdObjects(page);
    const productSchema = objects.find((object) => object["@type"] === "Product") as
      | {
          name?: string;
          image?: string[];
          offers?: { price?: string; url?: string };
        }
      | undefined;
    const breadcrumbSchema = objects.find((object) => object["@type"] === "BreadcrumbList");

    expect(productSchema).toBeTruthy();
    expect(productSchema?.name).toBe(product.name);
    expect(productSchema?.image?.[0]).toContain(product.image.src);
    expect(productSchema?.offers?.price).toBe(expectedPrice);
    expect(productSchema?.offers?.url).toContain(`/product/${product.slug}`);
    await expect(page.getByText(formatCurrency(Number(expectedPrice)))).toBeVisible();
    expect(breadcrumbSchema).toBeTruthy();
  });

  test("category and brand routes expose canonical metadata", async ({ page }) => {
    const categoryPath = catalogFixtures.laptopProduct.categoryPath.join("/");
    await page.goto(`/category/${categoryPath}`);
    await expect(
      page.getByRole("heading", { name: catalogFixtures.laptopProduct.categoryPath.at(-1)! })
    ).toBeVisible();
    await expectCanonical(page, `/category/${categoryPath}`);
    await expectIndexable(page);

    await page.goto(`/brand/${catalogFixtures.laptopProduct.brandSlug}`);
    const brand = getCatalog().brands.find(
      (entry) => entry.slug === catalogFixtures.laptopProduct.brandSlug
    )!;
    await expect(page.getByRole("heading", { name: brand.name, exact: true })).toBeVisible();
    await expectCanonical(page, `/brand/${catalogFixtures.laptopProduct.brandSlug}`);
    await expectIndexable(page);
  });

  test("robots, XML sitemap, and HTML sitemap expose discoverable routes", async ({ request, page }) => {
    const robots = await request.get("/robots.txt");
    const robotsText = await robots.text();
    expect(robots.status()).toBe(200);
    expect(robots.headers()["content-type"]).toContain("text/plain");
    expect(robotsText).toContain("Allow: /");
    expect(robotsText).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    const sitemapText = await sitemap.text();
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()["content-type"]).toContain("application/xml");
    expect(sitemapText).toContain(`/product/${catalogFixtures.discountedProduct.slug}</loc>`);
    expect(sitemapText).toContain("<urlset");

    await page.goto("/sitemap");
    await expect(page.getByRole("heading", { name: "HTML Sitemap" })).toBeVisible();
    await expect(page.getByRole("link", { name: catalogFixtures.discountedProduct.name })).toBeVisible();
  });

  test("invalid product route returns not found behavior", async ({ page }) => {
    const response = await page.goto("/product/not-a-real-product-for-seo");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });
});
