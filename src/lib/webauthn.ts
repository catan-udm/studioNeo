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

import { getBaseUrl } from '@/lib/oauth';

/**
 * Extracts a clean domain/hostname suitable for WebAuthn RP ID (no protocol, no port, no path).
 */
export function cleanDomain(value: string): string {
  let str = (value || '').trim();
  str = str.replace(/^[a-zA-Z]+:\/\//, '');
  str = str.split('/')[0];
  str = str.split(':')[0];
  return str.toLowerCase();
}

/**
 * Normalizes an origin URL string (no trailing slash, canonical protocol + host).
 */
export function cleanOrigin(value: string): string {
  const str = (value || '').trim();
  if (!str) return '';
  try {
    const url = new URL(str.includes('://') ? str : `https://${str}`);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return str.replace(/\/+$/, '').toLowerCase();
  }
}

/**
 * Derives RP (Relying Party) ID and Origin from the incoming request or environment.
 * Fully supports APP_URL and Azure Static Web Apps reverse proxy headers.
 */
export function getRPConfig(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const baseDomain = cleanDomain(baseUrl);

  const originHeader = request.headers.get('origin');
  const origin = originHeader ? cleanOrigin(originHeader) : cleanOrigin(baseUrl);

  const rawRpId = process.env.WEBAUTHN_RP_ID?.trim();
  const rpID = rawRpId ? cleanDomain(rawRpId) : (baseDomain || 'localhost');
  const rpName = process.env.WEBAUTHN_RP_NAME || 'Azure Cloud Studio';

  const expectedOrigins = Array.from(
    new Set(
      [
        origin,
        cleanOrigin(baseUrl),
        process.env.APP_URL ? cleanOrigin(process.env.APP_URL) : '',
        process.env.NEXT_PUBLIC_APP_URL ? cleanOrigin(process.env.NEXT_PUBLIC_APP_URL) : '',
        `https://${rpID}`,
        `http://${rpID}`,
        `http://${rpID}:3000`,
        `http://${rpID}:3001`,
        `http://${rpID}:8080`,
        `http://${rpID}:4280`,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4280',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:4280',
      ].filter(Boolean)
    )
  );

  return {
    rpID,
    rpName,
    origin,
    expectedOrigins,
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
  const isProd = process.env.NODE_ENV === 'production';
  cookieStore.delete({
    name: CHALLENGE_COOKIE_NAME,
    path: '/',
  });
  cookieStore.set(CHALLENGE_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
}

export default {
  getRPConfig,
  setPasskeyChallenge,
  getPasskeyChallenge,
  clearPasskeyChallenge,
};
