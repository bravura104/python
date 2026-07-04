import { NextRequest, NextResponse } from "next/server";
import { formatMfaCodeEmail, sendEmail } from "@/lib/mailer";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").toLowerCase().trim();
  const name = String(body.name || "").trim();

  if (!email) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const code = generateCode();
  const result = await sendEmail(
    formatMfaCodeEmail({
      email,
      customerName: name || undefined,
      code,
      expiresMinutes: Number(process.env.MFA_CODE_EXPIRES_MINUTES || 10),
    })
  );

  return NextResponse.json({ ok: true, sent: result.sent, code: process.env.NODE_ENV === "production" ? undefined : code });
}