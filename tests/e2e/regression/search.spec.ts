import { test, expect } from "../../support/fixtures/test";
import { catalogFixtures } from "../../support/catalog-fixtures";

const searchInputName = "Search";

async function submitSearch(page: import("@playwright/test").Page, query: string) {
  const searchForm = mainSearchForm(page);
  await searchForm.getByLabel(searchInputName).fill(query);
  await searchForm.getByRole("button", { name: "Search" }).click();
}

function mainSearchForm(page: import("@playwright/test").Page) {
  return page.locator("main").getByRole("search");
}

function expectedSearchPath(query: string): RegExp {
  const encodedQuery = new URLSearchParams({ q: query }).toString();
  return new RegExp(`/search\\?${escapeRegExp(encodedQuery)}`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.describe("@regression @search search validation", () => {
  const product = catalogFixtures.laptopProduct;

  [
    {
      name: "exact search",
      query: product.name,
      expectedHeading: `Results for "${product.name}"`,
      expectedProduct: product.name,
    },
    {
      name: "partial search",
      query: "laptop",
      expectedHeading: 'Results for "laptop"',
      expectedProduct: product.name,
    },
    {
      name: "case-insensitive search",
      query: product.name.toUpperCase(),
      expectedHeading: `Results for "${product.name.toUpperCase()}"`,
      expectedProduct: product.name,
    },
    {
      name: "leading and trailing spaces are trimmed",
      query: `  ${product.name}  `,
      expectedHeading: `Results for "${product.name}"`,
      expectedProduct: product.name,
    },
  ].forEach(({ name, query, expectedHeading, expectedProduct }) => {
    test(`${name} returns matching products`, async ({ page }) => {
      await page.goto("/search");
      await submitSearch(page, query);

      await expect(page).toHaveURL(expectedSearchPath(query.trim()));
      await expect(page.getByRole("heading", { name: expectedHeading })).toBeVisible();
      await expect(page.getByRole("article", { name: `Product: ${expectedProduct}` })).toBeVisible();
    });
  });

  test("empty search stays on the search landing state", async ({ page }) => {
    await page.goto("/search");
    await submitSearch(page, "   ");

    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByText("Popular searches:")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Results for/ })).toHaveCount(0);
  });

  test("no-results and special-character searches persist the query", async ({ page }) => {
    for (const query of [catalogFixtures.noResultsTerm, "@@@"]) {
      await page.goto("/search");
      await submitSearch(page, query);

      await expect(page).toHaveURL(expectedSearchPath(query));
      await expect(page.getByRole("heading", { name: `Results for "${query}"` })).toBeVisible();
      await expect(page.getByText("0 results")).toBeVisible();
      await expect(page.getByRole("article", { name: /^Product:/ })).toHaveCount(0);
    }
  });

  test("exact-match relevance keeps the matching result first", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(product.name)}`);

    const firstResult = page.getByRole("article", { name: /^Product:/ }).first();
    await expect(firstResult).toHaveAccessibleName(`Product: ${product.name}`);
  });

  test("URL query persists in the search field and result navigation opens detail", async ({ page }) => {
    await page.goto(`/search?q=${encodeURIComponent(product.name)}`);

    await expect(mainSearchForm(page).getByLabel(searchInputName)).toHaveValue(product.name);
    await page
      .getByRole("article", { name: `Product: ${product.name}` })
      .getByRole("link", { name: `View details for ${product.name}` })
      .click();

    await expect(page).toHaveURL(new RegExp(`/product/${product.slug}$`));
    await expect(page.getByRole("heading", { name: product.name })).toBeVisible();
  });
});
