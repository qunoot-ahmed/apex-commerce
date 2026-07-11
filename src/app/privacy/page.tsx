import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Apex Commerce privacy policy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="container col-lg-8">
      <h1 className="display-6 fw-bold mb-4">Privacy Policy</h1>
      <p>We respect your privacy. This demo storefront uses mock data and does not process real payments.</p>
    </div>
  );
}
