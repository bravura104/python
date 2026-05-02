import { notFound } from "next/navigation";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import AddToCartSection from "./AddToCartSection";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return (products as Product[]).map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = (products as Product[]).find((p) => p.id === id);

  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Product visual */}
        <div
          className="rounded-3xl h-[480px] flex items-center justify-center shadow-inner"
          style={{ backgroundColor: product.colors[0]?.hex ?? "#e5e7eb" }}
        >
          <span className="text-[160px] drop-shadow-xl select-none">👕</span>
        </div>

        {/* Product info + add to cart */}
        <div className="sticky top-24">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>
            {product.badge && (
              <span className="shrink-0 mt-1 bg-black text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                {product.badge}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>
          <AddToCartSection product={product} />
        </div>
      </div>
    </div>
  );
}
