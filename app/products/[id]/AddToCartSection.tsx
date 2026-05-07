"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const SIZE_GUIDE = [
  { size: "S",   chest: "86–91",   length: "68" },
  { size: "M",   chest: "96–101",  length: "71" },
  { size: "L",   chest: "107–112", length: "74" },
  { size: "XL",  chest: "117–122", length: "77" },
  { size: "2XL", chest: "127–132", length: "79" },
];

export default function AddToCartSection({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Color selector */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Color:{" "}
          <span className="font-normal text-gray-500">{selectedColor.name}</span>
        </p>
        <div className="flex gap-3">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c)}
              title={c.name}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                selectedColor.name === c.name
                  ? "border-black scale-110 shadow-md"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">
            Size:{" "}
            {!selectedSize && (
              <span className="text-red-500 font-normal">Please select a size</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setShowSizeGuide((v) => !v)}
            className="text-xs text-gray-500 underline hover:text-gray-800 transition-colors"
          >
            {showSizeGuide ? "Hide size guide" : "Size guide"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedSize === size
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {showSizeGuide && (
          <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden text-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 font-semibold text-gray-700">Size</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">Chest (cm)</th>
                  <th className="px-3 py-2 font-semibold text-gray-700">Length (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SIZE_GUIDE.map((row) => (
                  <tr key={row.size} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{row.size}</td>
                    <td className="px-3 py-2 text-gray-600">{row.chest}</td>
                    <td className="px-3 py-2 text-gray-600">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
              All measurements are body measurements. If between sizes, size up.
            </p>
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
        <div className="flex items-center border border-gray-300 rounded-xl w-fit overflow-hidden">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            −
          </button>
          <span className="px-5 py-2 font-semibold text-gray-900 min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="px-4 py-2 text-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize || added}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            added
              ? "bg-green-600 text-white"
              : !selectedSize
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 active:scale-95"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
        <button
          onClick={() => {
            if (!selectedSize) return;
            addItem({
              productId: product.id,
              name: product.name,
              price: product.price,
              size: selectedSize,
              color: selectedColor.name,
              colorHex: selectedColor.hex,
              quantity,
            });
            router.push("/cart");
          }}
          disabled={!selectedSize}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-black text-black hover:bg-black hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
