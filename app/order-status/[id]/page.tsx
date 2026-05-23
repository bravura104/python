"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type ShipStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderStatusData {
  payment_intent_id: string;
  status:            ShipStatus;
  tracking_number:   string | null;
  carrier:           string | null;
  tracking_url:      string | null;
  notes:             string | null;
  updated_at:        string;
}

const STEPS: { key: ShipStatus; label: string; emoji: string; desc: string }[] = [
  { key: "pending",    label: "Order Received",   emoji: "✅", desc: "Payment confirmed. Your order is in the queue." },
  { key: "processing", label: "Preparing",         emoji: "📦", desc: "We're packing your items and getting them ready to ship." },
  { key: "shipped",    label: "Shipped",            emoji: "🚚", desc: "Your order is on its way!" },
  { key: "delivered",  label: "Delivered",          emoji: "🎉", desc: "Your tee has arrived. Enjoy!" },
];

const STATUS_ORDER: Record<ShipStatus, number> = {
  pending:    0,
  processing: 1,
  shipped:    2,
  delivered:  3,
  cancelled:  -1,
};

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData]       = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/order-status/${encodeURIComponent(id)}`)
      .then((r) => {
        if (r.status === 404) throw new Error("not_found");
        if (!r.ok)             throw new Error("server_error");
        return r.json();
      })
      .then((d: OrderStatusData) => { setData(d); setLoading(false); })
      .catch((e: Error) => {
        setError(e.message === "not_found" ? "not_found" : "error");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex items-center justify-center gap-3 text-gray-400">
        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Looking up your order…
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-5">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h1>
        <p className="text-gray-500 mb-8">
          We couldn&apos;t find an order matching that reference. Check your confirmation email for the correct link.
        </p>
        <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-5">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Status</h1>
        <p className="text-gray-500 mb-8">Please try again in a moment.</p>
        <button onClick={() => window.location.reload()} className="inline-block bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER[data.status];
  const isCancelled  = data.status === "cancelled";

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Order Status</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">{data.payment_intent_id}</p>
      </div>

      {isCancelled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center mb-8">
          <div className="text-4xl mb-3">❌</div>
          <p className="font-bold text-red-700 text-lg">Order Cancelled</p>
          {data.notes && <p className="text-sm text-red-600 mt-1">{data.notes}</p>}
        </div>
      ) : (
        /* Progress timeline */
        <div className="relative mb-8">
          {/* vertical line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200" aria-hidden="true" />

          <ol className="space-y-0">
            {STEPS.map((step, idx) => {
              const done    = idx < currentIndex;
              const active  = idx === currentIndex;
              const pending = idx > currentIndex;

              return (
                <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* circle */}
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all ${
                    done   ? "border-green-500 bg-green-500 text-white"
                    : active ? "border-black bg-black text-white scale-110 shadow-md"
                    : "border-gray-200 bg-white text-gray-300"
                  }`}>
                    {done ? "✓" : step.emoji}
                  </div>

                  {/* text */}
                  <div className="pt-1.5">
                    <p className={`font-semibold text-sm ${active ? "text-gray-900" : done ? "text-green-700" : "text-gray-400"}`}>
                      {step.label}
                    </p>
                    {(active || done) && (
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    )}

                    {/* Tracking info — shown on the "shipped" step when active or done */}
                    {step.key === "shipped" && (active || done) && (data.tracking_number || data.carrier) && (
                      <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 space-y-1">
                        {data.carrier && (
                          <p><span className="font-semibold text-gray-500">Carrier:</span> {data.carrier}</p>
                        )}
                        {data.tracking_number && (
                          <p><span className="font-semibold text-gray-500">Tracking #:</span> <span className="font-mono">{data.tracking_number}</span></p>
                        )}
                        {data.tracking_url && (
                          <a
                            href={data.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1 text-blue-600 font-semibold hover:underline"
                          >
                            Track Package →
                          </a>
                        )}
                      </div>
                    )}

                    {/* Notes — shown only on the active step */}
                    {active && data.notes && (
                      <p className="mt-1 text-xs text-gray-500 italic">{data.notes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <p className="text-center text-xs text-gray-400">
        Last updated: {new Date(data.updated_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
      </p>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 underline transition-colors">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}
