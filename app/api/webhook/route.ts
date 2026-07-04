import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import type Stripe from "stripe";
import getStripe from "@/lib/stripe";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import { formatOrderConfirmedEmail, sendEmail } from "@/lib/mailer";
import { calcDisbursementAmount } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = (await getStripe()).webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true });
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // ── Resolve item details from metadata ──────────────────────────────────
  type MetaItem = { id: string; size: string; color: string; qty: number; barcode?: string };
  let metaItems: MetaItem[] = [];
  try {
    metaItems = JSON.parse(paymentIntent.metadata?.items ?? "[]");
  } catch {
    metaItems = [];
  }

  const orderItems = metaItems.map((mi) => {
    const product = (products as unknown as Product[]).find((p) => p.id === mi.id);
    // barcode from metadata is the goldenmart item barcode ("ITM_" + barcode = item code)
    const barcode = mi.barcode
      ?? product?.variants?.[`${mi.size}_${mi.color}`]
      ?? product?.variants?.[mi.size]
      ?? null;
    return {
      product_id: mi.id,
      sku:        barcode,
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
      const charge = await (await getStripe()).charges.retrieve(paymentIntent.latest_charge as string);
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
    const shipping = paymentIntent.shipping;
    const shippingAddress = shipping ? {
      name:        shipping.name ?? "",
      line1:       shipping.address?.line1 ?? "",
      line2:       shipping.address?.line2 ?? "",
      city:        shipping.address?.city ?? "",
      state:       shipping.address?.state ?? "",
      postal_code: shipping.address?.postal_code ?? "",
      country:     shipping.address?.country ?? "",
    } : null;

    const subtotalAmount = paymentIntent.amount / 100;
    const disbursementBreakdown = calcDisbursementAmount(subtotalAmount);

    const notifyPayload = {
      payment_intent_id: paymentIntent.id,
      customer_name:     customerName,
      customer_email:    customerEmail,
      total_amount:      subtotalAmount,
      discount_amount:   disbursementBreakdown.discount,
      disbursement_amount: disbursementBreakdown.disbursementAmount,
      fee_breakdown:     disbursementBreakdown,
      currency:          paymentIntent.currency,
      items:             orderItems,
      shipping_address:  shippingAddress,
    };

    // Log outgoing notification (server-side file)
    try {
      const logDir = path.resolve(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      const logFile = path.join(logDir, 'dovara_notify.log');
      const entry = { ts: new Date().toISOString(), event: 'notify', url: dovaraUrl, payload: notifyPayload };
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Failed to write dovara notify log:', e);
    }

    const res = await fetch(dovaraUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${dovaraSecret}`,
      },
      body: JSON.stringify(notifyPayload),
    });

    const resText = await res.text().catch(() => '');
    try {
      const logDir = path.resolve(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'dovara_notify.log');
      const entry = { ts: new Date().toISOString(), event: 'notify_result', status: res.status, body: resText };
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (e) {
      console.error('Failed to write dovara notify result log:', e);
    }

    if (!res.ok) {
      console.error(`Dovara order notify failed (${res.status}):`, resText);
    } else if (customerEmail) {
      try {
        await sendEmail(formatOrderConfirmedEmail({
          orderCode: paymentIntent.id,
          customerName,
          customerEmail,
          totalAmount: subtotalAmount,
        }));
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }
  } catch (err) {
    console.error("Failed to notify dovara.vn:", err);
  }

  return NextResponse.json({ received: true });
}
