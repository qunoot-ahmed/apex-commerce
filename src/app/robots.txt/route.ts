import { SITE_URL } from "@/lib/constants";

export function GET() {
  const base = SITE_URL.replace(/\/$/, "");
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml

# Crawler test entry point
# ${base}/crawler-test
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
