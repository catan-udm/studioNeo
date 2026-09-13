import { cookies } from 'next/headers';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

const CHALLENGE_COOKIE_NAME = 'passkey_challenge';
const CHALLENGE_TTL_SECONDS = 300; // 5 minutes

export interface PasskeyChallengePayload {
  challenge: string;
  subscriberId?: number;
  type: 'registration' | 'authentication';
  expiresAt: number;
}

/**
 * Derives RP (Relying Party) ID and Origin from the incoming request or environment.
 */
export function getRPConfig(request: NextRequest) {
  const hostHeader = request.headers.get('host') || 'localhost:3000';
  const hostname = hostHeader.split(':')[0]; // strip port

  const protocol = request.headers.get('x-forwarded-proto') || (hostHeader.includes('localhost') ? 'http' : 'https');
  const originHeader = request.headers.get('origin');

  const defaultOrigin = `${protocol}://${hostHeader}`;
  const origin = originHeader || process.env.NEXT_PUBLIC_APP_URL || defaultOrigin;
  const rpID = process.env.WEBAUTHN_RP_ID || hostname;
  const rpName = process.env.WEBAUTHN_RP_NAME || 'Azure Cloud Studio';

  return {
    rpID,
    rpName,
    origin,
  };
}

/**
 * Signs and stores a WebAuthn challenge in an httpOnly secure cookie.
 */
export async function setPasskeyChallenge(
  payload: Omit<PasskeyChallengePayload, 'expiresAt'>
): Promise<void> {
  const cookieStore = await cookies();
  const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!';
  const expiresAt = Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SECONDS;

  const data: PasskeyChallengePayload = {
    ...payload,
    expiresAt,
  };

  const serialized = JSON.stringify(data);
  const signature = crypto.createHmac('sha256', secret).update(serialized).digest('hex');
  const value = Buffer.from(JSON.stringify({ data, sig: signature })).toString('base64url');

  cookieStore.set(CHALLENGE_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CHALLENGE_TTL_SECONDS,
  });
}

/**
 * Retrieves and validates the signed WebAuthn challenge from cookie.
 */
export async function getPasskeyChallenge(
  expectedType: 'registration' | 'authentication'
): Promise<PasskeyChallengePayload | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(CHALLENGE_COOKIE_NAME);
    if (!cookie?.value) return null;

    const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!';
    const raw = Buffer.from(cookie.value, 'base64url').toString('utf8');
    const { data, sig } = JSON.parse(raw);

    const expectedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
    if (sig !== expectedSig) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (data.expiresAt < nowSeconds) return null;
    if (data.type !== expectedType) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Clears the WebAuthn challenge cookie after ceremony completion.
 */
export async function clearPasskeyChallenge(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CHALLENGE_COOKIE_NAME);
}

export default {
  getRPConfig,
  setPasskeyChallenge,
  getPasskeyChallenge,
  clearPasskeyChallenge,
};
