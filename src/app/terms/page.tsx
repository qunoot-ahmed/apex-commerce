import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Terms of Service",
  description: "Apex Commerce terms of service.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="container col-lg-8">
      <h1 className="display-6 fw-bold mb-4">Terms of Service</h1>
      <p>By using this site you agree to our demonstration terms for testing and evaluation purposes.</p>
    </div>
  );
}
