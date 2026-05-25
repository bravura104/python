import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/db';
import { signToken, createTokenPayload, TOKEN_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = (body.email || '').toLowerCase().trim();
  const name = (body.name || '').trim();
  const password = body.password || '';

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const id = await createUser(email, name || '', password);

  const token = await signToken(createTokenPayload(id, email));

  const res = NextResponse.json({ ok: true, id });
  res.cookies.set({ name: TOKEN_NAME, value: token, httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
