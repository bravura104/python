import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function RelatedItemsSection({
  title = "You may also like these items",
  items,
}: {
  title?: string;
  items: Product[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            More picks based on this product.
          </p>
        </div>
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Browse all products
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}