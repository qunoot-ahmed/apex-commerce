import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "My Account",
  description: "Manage your Apex Commerce account.",
  path: "/account",
});

export default function AccountPage() {
  return (
    <div className="container col-lg-6">
      <h1 className="display-6 fw-bold mb-4">My Account</h1>
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button type="button" className="nav-link active">Orders</button></li>
        <li className="nav-item"><button type="button" className="nav-link">Wishlist</button></li>
        <li className="nav-item"><button type="button" className="nav-link">Settings</button></li>
      </ul>
      <p className="text-muted">Sign in to view order history and saved items.</p>
    </div>
  );
}
