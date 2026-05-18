import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import NailSpaBooking from "@/components/NailSpaBooking";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.toLowerCase().trim() ?? "";
  const filtered = (products as Product[]).filter(
    (p) =>
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
  );

  return (
    <>
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
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-16">
            No products found for &ldquo;{q}&rdquo;.
          </p>
        )}
      </section>
    </div>

    <NailSpaBooking />
    </>
  );
}
