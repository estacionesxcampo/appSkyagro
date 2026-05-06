import { createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_123');

export function hashPassword(password: string): string {
  // Cifrado sha256 como pediste
  return createHash('sha256').update(password).digest('hex');
}

export async function createSessionToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h') // Sesión de 12 horas
    .sign(secretKey);
  return token;
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
