import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/catalog";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="alert alert-light border text-center py-5">
        <h2 className="h5">No products found</h2>
        <p className="text-muted mb-0">Try adjusting filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {products.map((product) => (
        <div key={product.id} className="col-6 col-md-4 col-lg-3">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
