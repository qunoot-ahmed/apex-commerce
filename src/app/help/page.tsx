import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { htmlSitemapUrl, crawlerTestUrl } from "@/lib/routes/urls";

export const metadata = buildPageMetadata({
  title: "Help Center",
  description: "Shipping, returns, and account help.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <div className="container col-lg-8">
      <h1 className="display-6 fw-bold mb-4">Help Center</h1>
      <div className="accordion" id="helpAccordion">
        {[
          { q: "Shipping", a: "Free shipping on orders over $75. Standard delivery 3–5 business days." },
          { q: "Returns", a: "30-day hassle-free returns on most items." },
          { q: "Account", a: "Manage orders and saved items from your account dashboard." },
        ].map((item, i) => (
          <div key={item.q} className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${i}`}
              >
                {item.q}
              </button>
            </h2>
            <div id={`collapse-${i}`} className="accordion-collapse collapse show">
              <div className="accordion-body">{item.a}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4">
        <Link href={htmlSitemapUrl()}>Browse sitemap</Link> ·{" "}
        <Link href={crawlerTestUrl()}>Crawler test hub</Link>
      </p>
    </div>
  );
}
