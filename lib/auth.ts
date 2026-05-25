import jwt from 'jsonwebtoken';

const TOKEN_NAME = 'dt_token';
const SECRET = process.env.DINGTEE_JWT_SECRET || process.env.NEXTAUTH_JWT_SECRET || '';

if (!SECRET) {
  console.warn('DINGTEE_JWT_SECRET not set — auth routes will be inactive');
}

export function createTokenPayload(userId: number, email: string) {
  return { sub: String(userId), email };
}

export async function signToken(payload: Record<string, any>, maxAgeSeconds = 60 * 60 * 24 * 7) {
  if (!SECRET) throw new Error('JWT secret not configured');
  return jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn: maxAgeSeconds });
}

export async function verifyToken(token: string) {
  if (!token || !SECRET) return null;
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    return decoded as Record<string, any>;
  } catch (e) {
    return null;
  }
}

export { TOKEN_NAME };
