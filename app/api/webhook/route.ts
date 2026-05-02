import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import getStripe from "@/lib/stripe";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // ── Resolve item details from metadata ──────────────────────────────────
  type MetaItem = { id: string; size: string; color: string; qty: number };
  let metaItems: MetaItem[] = [];
  try {
    metaItems = JSON.parse(paymentIntent.metadata?.items ?? "[]");
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

  // ── Retrieve customer email from charge billing details ──────────────────
  let customerName  = "";
  let customerEmail = "";
  try {
    if (paymentIntent.latest_charge) {
      const charge = await getStripe().charges.retrieve(paymentIntent.latest_charge as string);
      customerName  = charge.billing_details?.name  ?? "";
      customerEmail = charge.billing_details?.email ?? "";
    }
  } catch (err) {
    console.error("Failed to retrieve charge details:", err);
  }

  // ── Notify dovara.vn ─────────────────────────────────────────────────────
  const dovaraUrl    = process.env.DOVARA_ORDER_URL;
  const dovaraSecret = process.env.DOVARA_ORDER_SECRET;

  if (!dovaraUrl || !dovaraSecret) {
    console.error("DOVARA_ORDER_URL or DOVARA_ORDER_SECRET not configured");
    return NextResponse.json({ received: true });
  }

  try {
    const res = await fetch(dovaraUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${dovaraSecret}`,
      },
      body: JSON.stringify({
        payment_intent_id: paymentIntent.id,
        customer_name:     customerName,
        customer_email:    customerEmail,
        total_amount:      paymentIntent.amount / 100,
        currency:          paymentIntent.currency,
        items:             orderItems,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Dovara order notify failed (${res.status}):`, text);
    }
  } catch (err) {
    console.error("Failed to notify dovara.vn:", err);
  }

  return NextResponse.json({ received: true });
}
