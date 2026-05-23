import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Validate: Stripe payment_intent_ids are always pi_... and alphanumeric+underscore
  if (!id || !/^pi_[a-zA-Z0-9_]{1,200}$/.test(id)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const statusUrl = process.env.DOVARA_ORDER_STATUS_URL;
  if (!statusUrl) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `${statusUrl}?order_id=${encodeURIComponent(id)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (res.status === 404) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
