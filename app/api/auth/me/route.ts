import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, TOKEN_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  if (!token) return NextResponse.json({ user: null });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: Number(payload.sub || null), email: payload.email || null } });
}
