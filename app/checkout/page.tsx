"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({ totalPrice }: { totalPrice: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-success`,
      },
    });

    // Only runs if confirmPayment fails immediately (e.g., card declined)
    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-4 rounded-xl font-semibold text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Processing…
          </>
        ) : (
          `Pay $${totalPrice.toFixed(2)}`
        )}
      </button>

      {/* Payment trust badges */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <span className="text-xs text-gray-400">Secured by</span>
        {/* Visa */}
        <span className="inline-flex items-center px-2.5 py-1 rounded border border-gray-200 bg-white">
          <svg width="38" height="14" viewBox="0 0 38 14" aria-label="Visa">
            <text x="0" y="12" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#1a1f71" fontStyle="italic">VISA</text>
          </svg>
        </span>
        {/* Mastercard */}
        <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded border border-gray-200 bg-white" aria-label="Mastercard">
          <svg width="30" height="20" viewBox="0 0 30 20">
            <circle cx="10" cy="10" r="9" fill="#EB001B" />
            <circle cx="20" cy="10" r="9" fill="#F79E1B" />
            <path d="M15 3.8a9 9 0 0 1 0 12.4A9 9 0 0 1 15 3.8z" fill="#FF5F00" />
          </svg>
        </span>
        {/* PayPal */}
        <span className="inline-flex items-center px-2.5 py-1 rounded border border-gray-200 bg-white">
          <svg width="52" height="14" viewBox="0 0 52 14" aria-label="PayPal">
            <text x="0" y="11" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#003087">Pay</text>
            <text x="22" y="11" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#009cde">Pal</text>
          </svg>
        </span>
        <span className="text-xs text-gray-400">· 256-bit SSL</span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setFetchError(data.error);
        } else {
          setClientSecret(data.clientSecret as string);
        }
      })
      .catch(() => setFetchError("Failed to initialize payment. Please try again."));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
              Payment Details
            </h2>
            {!clientSecret ? (
              <div className="flex items-center justify-center py-10 text-gray-400 gap-3">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Loading payment form…
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm totalPrice={totalPrice} />
              </Elements>
            )}
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
                  <div
                    className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-xl"
                    style={{ backgroundColor: item.colorHex }}
                  >
                    👕
                  </div>
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
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
