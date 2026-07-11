import Link from "next/link";
import { generateCrawlerLinks, getCrawlerLinkStats } from "@/lib/crawler/links";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Crawler Test Hub",
  description:
    "Central discovery page with 1000+ internal links for SEO crawlers, analytics testing, and content map validation.",
  path: "/crawler-test",
});

export default function CrawlerTestPage() {
  const links = generateCrawlerLinks();
  const stats = getCrawlerLinkStats(links);

  const grouped = links.reduce<Record<string, typeof links>>((acc, link) => {
    if (!acc[link.group]) acc[link.group] = [];
    acc[link.group]!.push(link);
    return acc;
  }, {});

  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-4">
        <h1 className="display-5 fw-bold">Crawler Test Hub</h1>
        <p className="lead text-muted">
          Start here to discover the entire Apex Commerce URL ecosystem. This page exposes{" "}
          <strong>{stats.total}</strong> internal links across{" "}
          <strong>{Object.keys(stats.groups).length}</strong> groups (
          <strong>{stats.uniqueHrefs}</strong> unique hrefs).
        </p>
        <div className="row g-2 small">
          {Object.entries(stats.groups).map(([group, count]) => (
            <div key={group} className="col-auto">
              <span className="badge bg-dark">
                {group}: {count}
              </span>
            </div>
          ))}
        </div>
      </header>

      <nav aria-label="Crawler test sections" className="mb-4">
        <ul className="nav nav-pills flex-wrap gap-2">
          {Object.keys(grouped).map((group) => (
            <li key={group} className="nav-item">
              <a className="nav-link" href={`#group-${group.replace(/\s+/g, "-")}`}>
                {group}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {Object.entries(grouped).map(([group, groupLinks]) => (
        <section
          key={group}
          id={`group-${group.replace(/\s+/g, "-")}`}
          className="mb-5"
        >
          <h2 className="h4 fw-bold mb-3">
            {group}{" "}
            <span className="text-muted fs-6">({groupLinks.length} links)</span>
          </h2>
          <div className="crawler-link-grid">
            {groupLinks.map((link, i) => (
              <Link key={`${link.href}-${i}`} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
