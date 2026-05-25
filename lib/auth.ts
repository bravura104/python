import { SignJWT, jwtVerify } from 'jose';

const TOKEN_NAME = 'dt_token';
const SECRET = process.env.DINGTEE_JWT_SECRET || process.env.NEXTAUTH_JWT_SECRET || '';

if (!SECRET) {
  // we don't throw here to keep server startup tolerant in dev; requests will fail if secret missing
  console.warn('DINGTEE_JWT_SECRET not set — auth routes will be inactive');
}

export function createTokenPayload(userId: number, email: string) {
  return { sub: String(userId), email };
}

export async function signToken(payload: Record<string, any>, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + maxAgeSeconds;
  const alg = 'HS256';
  const key = new TextEncoder().encode(SECRET);
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(key as any);
  return jwt;
}

export async function verifyToken(token: string) {
  if (!token) return null;
  try {
    const key = new TextEncoder().encode(SECRET);
    const { payload } = await jwtVerify(token, key as any);
    return payload as Record<string, any>;
  } catch (e) {
    return null;
  }
}

export { TOKEN_NAME };
