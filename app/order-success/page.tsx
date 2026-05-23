/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type Status = "loading" | "succeeded" | "processing" | "failed";

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<Status>("loading");
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const clearedRef = useRef(false);

  useEffect(() => {
    const clientSecret   = searchParams.get("payment_intent_client_secret");
    const paymentIntentId = searchParams.get("payment_intent");

    async function checkStatus() {
      if (!clientSecret) {
        setStatus("failed");
        return;
      }
      const stripe = await stripePromise;
      if (!stripe) {
        setStatus("failed");
        return;
      }
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      if (paymentIntent?.status === "succeeded") {
        if (!clearedRef.current) {
          clearedRef.current = true;
          clearCart();
          setPaymentIntentId(paymentIntentId ?? null);
          // Read ad source for display
          try {
            const raw = localStorage.getItem("utm_data");
            if (raw) {
              const utm = JSON.parse(raw) as Record<string, string>;
              if (utm.utm_source) setUtmSource(utm.utm_source);
            }
          } catch { /* ignore */ }
          // Notify server → dovara.vn (email + DB save). Fire-and-forget.
          if (paymentIntentId) {
            fetch("/api/confirm-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentIntentId }),
            }).catch(() => {});
          }
        }
        setStatus("succeeded");
      } else if (paymentIntent?.status === "processing") {
        setStatus("processing");
      } else {
        setStatus("failed");
      }
    }

    checkStatus();
  }, [searchParams, clearCart]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
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
        Verifying payment…
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Thank you for your purchase. A confirmation email is on its way to you.
        </p>
        {paymentIntentId && (
          <div className="mb-8">
            <Link
              href={`/order-status/${paymentIntentId}`}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:border-black transition-colors text-sm shadow-sm"
            >
              🚚 Track Your Order
            </Link>
          </div>
        )}
        {utmSource && (
          <p className="text-xs text-gray-400 mb-6">
            Referred by: <span className="font-semibold">{utmSource}</span>
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Payment Processing
        </h1>
        <p className="text-gray-500 mb-8">
          Your payment is being processed. We&apos;ll send you a confirmation
          once it&apos;s complete.
        </p>
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          Return to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-6">❌</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
        Payment Failed
      </h1>
      <p className="text-gray-500 mb-8">
        Something went wrong with your payment. Please try again.
      </p>
      <Link
        href="/checkout"
        className="inline-block bg-black text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <Suspense
        fallback={
          <div className="py-20 text-center text-gray-400">Loading…</div>
        }
      >
        <OrderStatusContent />
      </Suspense>
    </div>
  );
}
