import { NextRequest, NextResponse } from "next/server";
import { calcShipping, calcDisbursementAmount, type ShippingOptionKey } from "@/lib/shipping";

export const dynamic = "force-dynamic";

type CartItemPayload = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type PaymentMethod = "payos" | "momo";

function buildReturnUrl(method: PaymentMethod, orderCode: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const base = method === "payos"
    ? (process.env.PAYOS_RETURN_URL ?? `${site}/order-success?provider=payos`)
    : (process.env.MOMO_RETURN_URL ?? `${site}/order-success?provider=momo`);

  const url = new URL(base);
  url.searchParams.set("orderCode", orderCode);
  return url.toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      paymentMethod?: PaymentMethod;
      items: CartItemPayload[];
      shippingOption?: string;
    };

    const paymentMethod: PaymentMethod = body.paymentMethod === "momo" ? "momo" : "payos";
    const items = body.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const validShippingOptions = ["standard", "express", "sameday"] as ShippingOptionKey[];
    const shippingOption = validShippingOptions.includes(body.shippingOption as ShippingOptionKey)
      ? (body.shippingOption as ShippingOptionKey)
      : "standard";

    const subtotal = items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0) * 1000, 0);
    const shippingFee = calcShipping(subtotal / 1000, shippingOption);
    const feeBreakdown = calcDisbursementAmount(subtotal / 1000);
    const orderCode = `${paymentMethod.toUpperCase()}-${Date.now()}`;
    const totalAmount = subtotal + Math.round(shippingFee * 1000);

    return NextResponse.json({
      paymentMethod,
      orderCode,
      paymentUrl: buildReturnUrl(paymentMethod, orderCode),
      amount: totalAmount,
      discountAmount: Math.round(feeBreakdown.discount * 1000),
      disbursementAmount: Math.round(feeBreakdown.disbursementAmount * 1000),
      feeBreakdown,
    });
  } catch (error) {
    console.error("Provider checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}