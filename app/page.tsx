import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center mb-14">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Premium T-Shirts
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Quality cotton tees designed for everyday wear. Pick your style, choose
          your size, and wear it well.
        </p>
      </section>

      {/* Product grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
