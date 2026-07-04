import { NextRequest, NextResponse } from "next/server";
import getStripe from "@/lib/stripe";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";
import { calcShipping, calcDisbursementAmount, type ShippingOptionKey, SHIPPING_RATES } from "@/lib/shipping";

export const dynamic = "force-dynamic";

// Allowed browser origins — only our own domain may call this endpoint
const ALLOWED_ORIGINS = new Set(
  process.env.NODE_ENV === "production"
    ? ["https://mart35-test.vn", "https://www.mart35-test.vn", "https://mart36.vn", "https://www.mart36.vn"]
    : ["http://localhost:3000"]
);

interface CartItemPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
  barcode?: string;
}

export async function POST(req: NextRequest) {
  // Origin check — block cross-site requests from untrusted origins
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json() as {
      items: CartItemPayload[];
      shippingOption?: string;
      utmData?: Record<string, string>;
    };
    const { items, shippingOption, utmData } = body;

    // Sanitize UTM fields – strip anything outside safe characters, cap lengths
    const sanitize = (v: unknown, max: number) =>
      typeof v === "string" ? v.replace(/[^a-zA-Z0-9_\-. ]/g, "").slice(0, max) : "";
    const utmSource   = sanitize(utmData?.utm_source,   100);
    const utmMedium   = sanitize(utmData?.utm_medium,   100);
    const utmCampaign = sanitize(utmData?.utm_campaign, 200);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const validShippingOptions = Object.keys(SHIPPING_RATES) as ShippingOptionKey[];
    const resolvedShipping: ShippingOptionKey =
      shippingOption && validShippingOptions.includes(shippingOption as ShippingOptionKey)
        ? (shippingOption as ShippingOptionKey)
        : "standard";

    // Calculate amount server-side from the authoritative product catalog
    let amount = 0;
    for (const item of items) {
      if (
        typeof item.productId !== "string" ||
        typeof item.size !== "string" ||
        typeof item.color !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
      }

      const product = (products as unknown as Product[]).find(
        (p) => p.id === item.productId
      );
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      amount += Math.round(product.price * 100) * item.quantity;
    }

    const subtotalCents = amount;
    const shippingCents = Math.round(calcShipping(subtotalCents / 100, resolvedShipping) * 100);
    const feeBreakdown  = calcDisbursementAmount(subtotalCents / 100);
    const discountCents = Math.round(feeBreakdown.discount * 100);
    const totalCents    = subtotalCents + shippingCents;

    // ── Inventory check — block checkout if any item is out of stock ───────
    const inventoryUrl = process.env.DOVARA_INVENTORY_URL;
    if (inventoryUrl) {
      const productIds = [...new Set(items.map((i) => i.productId))];
      const stockByProduct: Record<string, Record<string, Record<string, number>>> = {};

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const res = await fetch(
              `${inventoryUrl}?product_id=${encodeURIComponent(pid)}`,
              { signal: AbortSignal.timeout(4000) }
            );
            if (!res.ok) return;
            const data = await res.json() as { skus?: { size: string; color: string; stock: number }[] };
            stockByProduct[pid] = {};
            for (const sku of data.skus ?? []) {
              if (!stockByProduct[pid][sku.size]) stockByProduct[pid][sku.size] = {};
              stockByProduct[pid][sku.size][sku.color] = sku.stock;
            }
          } catch {
            // Inventory API unavailable — don't block checkout
          }
        })
      );

      for (const item of items) {
        const avail = stockByProduct[item.productId]?.[item.size]?.[item.color];
        if (avail !== undefined && avail < item.quantity) {
          return NextResponse.json(
            { error: `"${item.size} / ${item.color}" is out of stock. Please update your cart.` },
            { status: 422 }
          );
        }
      }
    }

    const paymentIntent = await (await getStripe()).paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(
          items.map((i) => ({
            id: i.productId,
            size: i.size,
            color: i.color,
            qty: i.quantity,
          }))
        ),
        shipping_option: resolvedShipping,
        shipping_fee: (shippingCents / 100).toFixed(2),
        discount_amount: (discountCents / 100).toFixed(2),
        disbursement_amount: feeBreakdown.disbursementAmount.toFixed(2),
        ...(utmSource   && { utm_source:   utmSource }),
        ...(utmMedium   && { utm_medium:   utmMedium }),
        ...(utmCampaign && { utm_campaign: utmCampaign }),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
