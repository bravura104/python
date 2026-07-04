"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  calcShipping,
  SHIPPING_RATES,
  FREE_SHIPPING_THRESHOLD,
  calcDisbursementAmount,
  type ShippingOptionKey,
} from "@/lib/shipping";
import ProductImage from "@/components/ProductImage";
import RelatedItemsSection from "@/components/RelatedItemsSection";
import type { Product } from "@/lib/types";

type PaymentMethod = "payos" | "momo";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("payos");
  const [shippingOption, setShippingOption] = useState<ShippingOptionKey>("standard");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const shippingFee = calcShipping(totalPrice, shippingOption);
  const feeBreakdown = calcDisbursementAmount(totalPrice);
  const disbursementAmount = feeBreakdown.disbursementAmount;
  const grandTotal  = totalPrice + shippingFee;

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;
    setPaymentUrl(null);
    setFetchError(null);

    fetch("/api/checkout/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          barcode: i.barcode ?? undefined,
        })),
        shippingOption,
        utmData: (() => {
          try {
            const raw = localStorage.getItem("utm_data");
            return raw ? JSON.parse(raw) : undefined;
          } catch {
            return undefined;
          }
        })(),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setFetchError(data.error);
        } else {
          setPaymentUrl(data.paymentUrl as string | null);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError("Failed to initialize payment. Please try again.");
      });

    return () => { cancelled = true; };
  }, [items, shippingOption, paymentMethod]); // re-run when cart, shipping, or provider changes

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
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 mb-6">{fetchError}</p>
        <button
          onClick={() => router.push("/cart")}
          className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Payment form */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Shipping &amp; Payment
            </h2>
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Payment Method</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["payos", "PayOS"], ["momo", "MoMo"]).map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl border p-4 text-sm transition-colors ${paymentMethod === value ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value as PaymentMethod)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {paymentMethod === "payos"
                    ? "PayOS checkout is ready."
                    : "MoMo checkout is ready."}
                </p>
                {paymentUrl ? (
                  <a
                    href={paymentUrl}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-black px-6 py-4 font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Continue to {paymentMethod === "payos" ? "PayOS" : "MoMo"}
                  </a>
                ) : (
                  <div className="flex items-center justify-center py-10 text-gray-400 gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading payment link…
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              Order Summary
            </h2>
            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex items-center gap-3"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    bgColor={item.colorHex}
                    className="w-12 h-12 rounded-lg shrink-0"
                    emojiSize="text-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.size} · {item.color} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {/* Shipping method selector */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Shipping Method</p>
              {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                <p className="text-sm text-green-600 font-medium">✓ Free shipping applied on orders over ${FREE_SHIPPING_THRESHOLD}</p>
              ) : (
                <div className="space-y-2">
                  {(Object.keys(SHIPPING_RATES) as ShippingOptionKey[]).map((key) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-xl border transition-colors ${
                        shippingOption === key
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={key}
                        checked={shippingOption === key}
                        onChange={() => setShippingOption(key)}
                        className="accent-black"
                      />
                      <span className="flex-1 text-sm text-gray-800">{SHIPPING_RATES[key].label}</span>
                      <span className="text-sm font-semibold text-gray-900">${SHIPPING_RATES[key].price.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span>${shippingFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Discount / fees</span>
                <span>${feeBreakdown.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Disbursement amount</span>
                <span>${disbursementAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedItemsSection items={relatedProducts} />
    </div>
  );
}
