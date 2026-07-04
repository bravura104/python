import { NextRequest, NextResponse } from "next/server";
import { formatMfaCodeEmail, sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const kind = String(body.kind || "");

  if (kind === "mfa") {
    const email = String(body.email || "").toLowerCase().trim();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await sendEmail(formatMfaCodeEmail({
      email,
      code,
      customerName: String(body.customerName || "").trim() || undefined,
      expiresMinutes: Number(body.expiresMinutes || 10),
    }));

    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({ error: "Unsupported notification kind" }, { status: 400 });
}
