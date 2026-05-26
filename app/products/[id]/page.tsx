import { notFound } from "next/navigation";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import AddToCartSection from "./AddToCartSection";
import ProductImage from "@/components/ProductImage";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES } from "@/lib/shipping";

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
        {/* Product image — large view */}
        <ProductImage
          src={product.image}
          alt={product.name}
          bgColor={product.colors[0]?.hex ?? "#e5e7eb"}
          className="rounded-3xl h-[480px] shadow-inner"
          emojiSize="text-[160px]"
        />

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
            <span id="product-price">${product.price.toFixed(2)}</span>
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Shipping info */}
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0 text-gray-500 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <div className="space-y-0.5">
              <p>
                <strong className="text-gray-900">Standard</strong>
                {" — Ships within 3–5 business days · "}
                <span className="font-medium">${SHIPPING_RATES.standard.price.toFixed(2)}</span>
              </p>
              <p>
                <strong className="text-gray-900">Same-day</strong>
                {" — Ontario only · "}
                <span className="font-medium">${SHIPPING_RATES.sameday_ontario.price.toFixed(2)}</span>
              </p>
              <p className="text-green-700 font-medium">
                Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}
              </p>
            </div>
          </div>

          <AddToCartSection product={product} />
        </div>
      </div>
    </div>
  );
}
