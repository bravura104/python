"use client";

import { useState, useEffect, useRef } from "react";
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
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? { name: "Default", hex: "#6b7280" });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [priceMap, setPriceMap] = useState<Record<string, { price_cents: number; from?: string; to?: string }>>({});
  const [flashOOS, setFlashOOS] = useState(false);
  const reportedOOS = useRef(new Set<string>());
  const [skuBarcodeMap, setSkuBarcodeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/inventory/${product.id}`)
      .then((r) => r.json())
      .then((data: { skus?: { size: string; color: string; stock: number; price_cents?: number; price_effective_from?: string; price_effective_to?: string; barcode?: string }[] }) => {
        const map: Record<string, number> = {};
        const pmap: Record<string, { price_cents: number; from?: string; to?: string }> = {};
        const barcodeMap: Record<string, string> = {};
        for (const sku of data.skus ?? []) {
          map[`${sku.size}_${sku.color}`] = sku.stock;
          if (sku.price_cents !== undefined && sku.price_cents !== null) {
            pmap[`${sku.size}_${sku.color}`] = {
              price_cents: Number(sku.price_cents),
              from: sku.price_effective_from || undefined,
              to: sku.price_effective_to || undefined,
            };
          }
          if (sku.barcode) {
            barcodeMap[`${sku.size}_${sku.color}`] = sku.barcode;
          }
        }
        setStockMap(map);
        setPriceMap(pmap);
        setSkuBarcodeMap(barcodeMap);
      })
      .catch(() => {}); // silently fail — don't block purchase
  }, [product.id]);

  function stockFor(size: string, color: string): number | null {
    const key = `${size}_${color}`;
    return key in stockMap ? stockMap[key] : null;
  }
  function isSizeOOS(size: string) {
    const s = stockFor(size, selectedColor.name);
    return s === null || s === 0;
  }
  function isColorOOS(colorName: string) {
    if (!selectedSize) return false;
    const s = stockFor(selectedSize, colorName);
    return s === null || s === 0;
  }

  // Declare BEFORE the useEffect that references them (avoids TDZ)
  const selectedStockQty = selectedSize ? stockFor(selectedSize, selectedColor.name) : null;
  const isSelectedOOS = selectedStockQty === null || selectedStockQty === 0;

  function priceFor(size: string, color: string): number | null {
    const key = `${size}_${color}`;
    if (priceMap[key]) return priceMap[key].price_cents / 100;
    return null;
  }

  // Displayed price for the current selection — only use Dovara per-SKU price.
  // If Dovara does not provide a price for the selected SKU, treat price as unavailable.
  const displayedPrice: number | null = selectedSize ? priceFor(selectedSize, selectedColor.name) ?? null : null;

  // Keep the server-rendered main price element in sync when a per-SKU price is available.
  useEffect(() => {
    const el = document.getElementById('product-price');
    if (!el) return;
    if (displayedPrice === null) {
      el.textContent = 'Price unavailable';
      return;
    }
    el.textContent = `$${displayedPrice.toFixed(2)}`;
  }, [displayedPrice]);

  // Report OOS demand — fires once per SKU combo per browser session
  useEffect(() => {
    if (!isSelectedOOS || !selectedSize) return;
    const key = `${product.id}_${selectedSize}_${selectedColor.name}`;
    if (reportedOOS.current.has(key)) return;
    reportedOOS.current.add(key);
    fetch("/api/inventory/demand", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id:   product.id,
        product_name: product.name,
        size:         selectedSize,
        color:        selectedColor.name,
      }),
    }).catch(() => {});
  }, [isSelectedOOS, selectedSize, selectedColor.name, product.id, product.name]);

  const triggerOOSFlash = () => {
    setFlashOOS(true);
    setTimeout(() => setFlashOOS(false), 700);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    if (isSelectedOOS) { triggerOOSFlash(); return; }
    if (displayedPrice === null) {
      // Visual feedback: flash price area
      const el = document.getElementById('product-price');
      if (el) {
        el.classList.add('text-red-600');
        setTimeout(() => el.classList.remove('text-red-600'), 900);
      }
      alert('Price unavailable for the selected size/color. Please contact the shop.');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: displayedPrice,
      size: selectedSize,
      color: selectedColor.name,
      colorHex: selectedColor.hex,
      quantity,
      image: product.image,
      barcode: skuBarcodeMap[`${selectedSize}_${selectedColor.name}`] ?? undefined,
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
              title={isColorOOS(c.name) ? `${c.name} — out of stock` : c.name}
              className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                selectedColor.name === c.name
                  ? "border-black scale-110 shadow-md"
                  : isColorOOS(c.name)
                  ? "border-gray-200 opacity-40"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {isColorOOS(c.name) && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">✕</span>
              )}
            </button>
          ))}
        </div>
        {selectedSize && skuBarcodeMap[`${selectedSize}_${selectedColor.name}`] && (
          <div className="mt-2 text-sm text-gray-500">
            SKU: <span className="font-mono text-xs">{skuBarcodeMap[`${selectedSize}_${selectedColor.name}`]}</span>
          </div>
        )}
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
              title={isSizeOOS(size) ? `${size} — out of stock (tap to select anyway)` : size}
              className={`relative px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedSize === size
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-black active:scale-95"
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

      {/* SKU stock status — shown once both color + size are chosen */}
      {selectedSize && (
        <div className={`flex items-start gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
          isSelectedOOS
            ? `bg-red-50 border-red-200 text-red-700${flashOOS ? " ring-2 ring-red-400 ring-offset-1 scale-[1.02]" : ""}`
            : selectedStockQty !== null && selectedStockQty <= 5
            ? "bg-orange-50 border-orange-200 text-orange-700"
            : "bg-green-50 border-green-200 text-green-700"
        }`}>
          <span className="text-base leading-none mt-px">
            {isSelectedOOS ? "🔴" : selectedStockQty !== null && selectedStockQty <= 5 ? "⚠️" : "✅"}
          </span>
          <div>
            <div>
              {isSelectedOOS
                ? `${selectedColor.name} / ${selectedSize} is out of stock`
                : selectedStockQty !== null && selectedStockQty <= 5
                ? `Only ${selectedStockQty} left in ${selectedColor.name} / ${selectedSize}`
                : `${selectedColor.name} / ${selectedSize} — in stock`}
            </div>
            {isSelectedOOS && (
              <div className="text-xs font-normal text-red-500 mt-0.5">
                We&apos;ve noted your interest — you can still add to cart to join the waitlist.
              </div>
            )}
          </div>
          {/* Show SKUP (barcode) when available */}
          {skuBarcodeMap[`${selectedSize}_${selectedColor.name}`] && (
            <div className="text-xs text-gray-500 mt-1">SKU: {skuBarcodeMap[`${selectedSize}_${selectedColor.name}`]}</div>
          )}
        </div>
      )}

      {/* Action buttons — never disabled; OOS shows flash + records demand */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold">
            {selectedSize
              ? (priceFor(selectedSize, selectedColor.name) ?? product.price).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
              : product.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all ${
            added
              ? "bg-green-600 text-white"
              : isSelectedOOS && selectedSize
              ? "bg-gray-900 text-white hover:bg-black active:scale-95"
              : "bg-black text-white hover:bg-gray-800 active:scale-95"
          }`}
        >
          {added ? "✓ Added to Cart" : "Add to Cart"}
        </button>
        <button
          onClick={() => {
            if (!selectedSize) return;
            if (isSelectedOOS) { triggerOOSFlash(); return; }
            addItem({
              productId: product.id,
              name: product.name,
              price: priceFor(selectedSize, selectedColor.name) ?? product.price,
              size: selectedSize,
              color: selectedColor.name,
              colorHex: selectedColor.hex,
              quantity,
            });
            router.push("/cart");
          }}
          className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 border-black text-black hover:bg-black hover:text-white transition-all active:scale-95"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
