import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: TOKEN_NAME, value: '', httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 0 });
  return res;
}
