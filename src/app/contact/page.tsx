import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Contact",
  description: "Contact Apex Commerce customer support.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container col-lg-6">
      <h1 className="display-6 fw-bold mb-4">Contact Us</h1>
      <form className="row g-3">
        <div className="col-12">
          <label className="form-label" htmlFor="name">Name</label>
          <input id="name" className="form-control" type="text" required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="form-control" type="email" required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="message">Message</label>
          <textarea id="message" className="form-control" rows={5} required />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-dark">
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
}
