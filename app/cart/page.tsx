"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_RATES, CA_TAX_RATE } from "@/lib/shipping";
import ProductImage from "@/components/ProductImage";
import RelatedItemsSection from "@/components/RelatedItemsSection";
import type { Product } from "@/lib/types";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } =
    useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    if (productIds.length === 0) {
      setRelatedProducts([]);
      return;
    }

    fetch("/api/related-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    })
      .then((r) => r.json())
      .then((data: { items?: Product[] }) => {
        setRelatedProducts(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setRelatedProducts([]));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added any items yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        Your Cart{" "}
        <span className="text-gray-400 font-normal text-xl">
          ({totalItems} {totalItems === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-4 p-5 rounded-2xl border border-gray-200 bg-white"
            >
              {/* Color thumbnail */}
              <ProductImage
                src={item.image}
                alt={item.name}
                bgColor={item.colorHex}
                className="w-20 h-20 rounded-xl shrink-0"
                emojiSize="text-3xl"
              />

              {/* Item details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Size: {item.size} · Color: {item.color}
                    </p>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Qty controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 font-medium text-gray-900 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>
                Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <span className="text-green-600 font-medium">Free ✓</span>
              ) : (
                <span className="text-gray-500">From ${SHIPPING_RATES.standard.price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Est. CA tax (7.75%)</span>
              <span>${(totalPrice * CA_TAX_RATE).toFixed(2)}</span>
            </div>
            {totalPrice < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                Add ${(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(2)} more for free shipping!
              </p>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
              <span>Total</span>
              <span>${(totalPrice + totalPrice * CA_TAX_RATE).toFixed(2)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full text-center bg-black text-white py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/"
            className="mt-3 block w-full text-center text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      <RelatedItemsSection items={relatedProducts} />
    </div>
  );
}
