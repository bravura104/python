import { NextRequest, NextResponse } from 'next/server';
import { verifyUserPassword } from '@/lib/db';
import { signToken, createTokenPayload, TOKEN_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').toLowerCase().trim();
  const password = body.password || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const user = await verifyUserPassword(email, password);
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = await signToken(createTokenPayload(user.id, user.email));
  const res = NextResponse.json({ ok: true, id: user.id, email: user.email, name: user.name });
  res.cookies.set({ name: TOKEN_NAME, value: token, httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
