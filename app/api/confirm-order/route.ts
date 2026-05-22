import { NextRequest, NextResponse } from "next/server";
import getStripe from "@/lib/stripe";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set(
  process.env.NODE_ENV === "production"
    ? ["https://dingtee909.com", "https://www.dingtee909.com", "https://ding-tee.dovara.biz"]
    : ["http://localhost:3000"]
);

type MetaItem = { id: string; size: string; color: string; qty: number };

/**
 * POST /api/confirm-order
 * Called from the order-success page after Stripe confirms payment.
 * Verifies the PaymentIntent server-side, then notifies dovara.vn (email + DB).
 * Idempotent: dovara.vn uses INSERT IGNORE on payment_intent_id.
 */
export async function POST(req: NextRequest) {
  // Origin guard
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { paymentIntentId?: string };
  const { paymentIntentId } = body;

  if (
    !paymentIntentId ||
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.startsWith("pi_")
  ) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // ── Verify payment server-side ────────────────────────────────────────────
  const stripe = await getStripe();
  let pi;
  try {
    pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return NextResponse.json({ error: "Payment intent not found" }, { status: 400 });
  }

  if (pi.status !== "succeeded") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  // ── Resolve order items from PI metadata ──────────────────────────────────
  let metaItems: MetaItem[] = [];
  try {
    metaItems = JSON.parse(pi.metadata?.items ?? "[]");
  } catch {
    metaItems = [];
  }

  const orderItems = metaItems.map((mi) => {
    const product = (products as Product[]).find((p) => p.id === mi.id);
    return {
      name:       product?.name ?? mi.id,
      size:       mi.size,
      color:      mi.color,
      qty:        mi.qty,
      unit_price: product?.price ?? 0,
    };
  });

  // ── Get customer name / email from charge ─────────────────────────────────
  let customerName  = "";
  let customerEmail = "";
  try {
    if (pi.latest_charge) {
      const charge = await stripe.charges.retrieve(pi.latest_charge as string);
      customerName  = charge.billing_details?.name  ?? "";
      customerEmail = charge.billing_details?.email ?? "";
    }
  } catch (err) {
    console.error("confirm-order: failed to retrieve charge:", err);
  }

  // ── Notify dovara.vn (saves to DB + sends email) ──────────────────────────
  const dovaraUrl    = process.env.DOVARA_ORDER_URL;
  const dovaraSecret = process.env.DOVARA_ORDER_SECRET;

  if (!dovaraUrl || !dovaraSecret) {
    console.error("confirm-order: DOVARA_ORDER_URL or DOVARA_ORDER_SECRET not configured");
    return NextResponse.json({ ok: true });
  }

  const shipping = pi.shipping;
  const shippingAddress = shipping ? {
    name:        shipping.name        ?? "",
    line1:       shipping.address?.line1        ?? "",
    line2:       shipping.address?.line2        ?? "",
    city:        shipping.address?.city         ?? "",
    state:       shipping.address?.state        ?? "",
    postal_code: shipping.address?.postal_code  ?? "",
    country:     shipping.address?.country      ?? "",
  } : null;

  try {
    const res = await fetch(dovaraUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${dovaraSecret}`,
      },
      body: JSON.stringify({
        payment_intent_id: pi.id,
        customer_name:     customerName,
        customer_email:    customerEmail,
        total_amount:      pi.amount / 100,
        currency:          pi.currency,
        items:             orderItems,
        shipping_address:  shippingAddress,
        utm_source:        pi.metadata?.utm_source   || undefined,
        utm_medium:        pi.metadata?.utm_medium   || undefined,
        utm_campaign:      pi.metadata?.utm_campaign || undefined,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`confirm-order: dovara notify failed (${res.status}):`, text);
    }
  } catch (err) {
    console.error("confirm-order: failed to notify dovara.vn:", err);
  }

  return NextResponse.json({ ok: true });
}
