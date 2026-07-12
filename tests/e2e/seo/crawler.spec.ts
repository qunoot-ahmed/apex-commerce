import { test, expect } from "../../support/fixtures/test";

type CrawlResult = {
  url: string;
  status: number;
  redirectedTo?: string;
};

const routeLimit = Number(process.env.CRAWLER_ROUTE_LIMIT ?? 30);
const concurrency = 4;
const excludedProtocols = ["mailto:", "tel:", "javascript:"];

function extractInternalLinks(html: string, pageUrl: string, origin: string) {
  const links = new Set<string>();
  const anchorPattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;

  while (true) {
    const match = anchorPattern.exec(html);
    if (!match) break;

    const href = match[1]!;
    const candidate = new URL(href, pageUrl);
    if (excludedProtocols.includes(candidate.protocol)) continue;
    if (candidate.origin !== origin) continue;

    candidate.hash = "";
    if (candidate.searchParams.has("utm_source") || candidate.searchParams.has("utm_campaign")) {
      candidate.search = "";
    }
    links.add(`${candidate.pathname}${candidate.search}`);
  }

  return [...links];
}

test.describe("@seo bounded crawler", () => {
  test("crawler-test exposes a bounded set of healthy same-origin routes", async ({ request }) => {
    test.setTimeout(120_000);
    const start = "/crawler-test";
    const queue = [start];
    const queued = new Set(queue);
    const visited = new Set<string>();
    const results: CrawlResult[] = [];

    async function crawlOne(path: string) {
      const response = await request.get(path, { maxRedirects: 2, timeout: 60_000 });
      const body = await response.text();
      const responseUrl = response.url();
      const origin = new URL(responseUrl).origin;
      const target = new URL(path, origin).toString();

      results.push({
        url: path,
        status: response.status(),
        redirectedTo: responseUrl === target ? undefined : responseUrl,
      });

      if (response.status() >= 400 || !response.headers()["content-type"]?.includes("text/html")) {
        return;
      }

      for (const link of extractInternalLinks(body, responseUrl, origin)) {
        if (queued.has(link) || visited.has(link)) continue;
        if (queued.size >= routeLimit) break;
        queued.add(link);
        queue.push(link);
      }
    }

    while (queue.length && visited.size < routeLimit) {
      const batch = queue.splice(0, concurrency).filter((path) => !visited.has(path));
      batch.forEach((path) => visited.add(path));
      await Promise.all(batch.map(crawlOne));
    }

    const failures = results.filter((result) => result.status >= 400);
    const redirects = results.filter((result) => result.redirectedTo);

    expect(results.length).toBeGreaterThan(10);
    expect(results.length).toBeLessThanOrEqual(routeLimit);
    expect(
      failures,
      `Crawler found failing routes: ${JSON.stringify(failures, null, 2)}`
    ).toEqual([]);
    expect(
      redirects,
      `Redirects are recorded separately for review: ${JSON.stringify(redirects, null, 2)}`
    ).toEqual([]);
  });
});
