import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const bgColor = product.colors[0]?.hex ?? "#e5e7eb";

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-gray-200 group-hover:border-gray-400 group-hover:shadow-xl transition-all duration-200">
        {/* Product visual */}
        <div className="relative">
          <ProductImage
            src={product.image}
            alt={product.name}
            bgColor={bgColor}
            className="h-44"
            emojiSize="text-7xl"
          />
          {product.badge && (
            <span className="absolute top-3 right-3 bg-black text-white text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide">
              {product.badge}
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="p-5 bg-white">
          <h3 className="font-semibold text-lg text-gray-900 leading-snug">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1.5">
              {product.colors.map((c) => (
                <div
                  key={c.name}
                  className="w-5 h-5 rounded-full border-2 border-gray-200 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <span className="block w-full text-center bg-black text-white text-sm font-medium py-2.5 rounded-xl group-hover:bg-gray-800 transition-colors">
              View &amp; Buy
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
