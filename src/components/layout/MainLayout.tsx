import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCatalog } from "@/lib/data/catalog";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { categories } = getCatalog();
  return (
    <>
      <Header categories={categories} />
      <main className="apex-main flex-grow-1 py-4">{children}</main>
      <Footer />
    </>
  );
}
