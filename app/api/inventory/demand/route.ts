import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const demandUrl = process.env.DOVARA_DEMAND_URL;
  const secret    = process.env.DOVARA_ORDER_SECRET;

  if (!demandUrl || !secret) {
    // Not configured — silently ignore, don't break the client
    return NextResponse.json({ status: "ok" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    await fetch(demandUrl, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${secret}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Fire-and-forget — don't surface errors to the client
  }

  return NextResponse.json({ status: "ok" });
}
