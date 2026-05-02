import { NextRequest, NextResponse } from "next/server";
import getStripe from "@/lib/stripe";
import products from "@/data/products.json";
import type { Product } from "@/lib/types";

interface CartItemPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { items: CartItemPayload[] };
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

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

      const product = (products as Product[]).find(
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

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
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
