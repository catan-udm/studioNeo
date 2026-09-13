import crypto from 'crypto';
import { cookies } from 'next/headers';

export type OAuthProvider = 'google' | 'microsoft';

const OAUTH_COOKIE_NAME = 'oauth_session';
const OAUTH_TTL_SECONDS = 600; // 10 minutes

export interface OAuthSessionData {
  state: string;
  codeVerifier: string;
  provider: OAuthProvider;
  subscriberId?: number;
  action?: 'signin' | 'link' | 'register';
  expiresAt: number;
}

export interface OAuthUserProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  displayName?: string;
}

/**
 * Returns provider-specific endpoints and client credentials.
 */
export function getProviderConfig(provider: OAuthProvider) {
  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scopes: ['openid', 'email', 'profile'],
    };
  }

  if (provider === 'microsoft') {
    const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
    return {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      authUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
      scopes: ['openid', 'email', 'profile', 'User.Read'],
    };
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}

/**
 * Generates a high-entropy PKCE code verifier and S256 code challenge.
 */
export function generatePKCE() {
  const codeVerifier = crypto
    .randomBytes(32)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return { codeVerifier, codeChallenge };
}

/**
 * Generates a cryptographically random state parameter for CSRF mitigation.
 */
export function generateState(): string {
  return crypto.randomBytes(24).toString('hex');
}

/**
 * Stores OAuth state and PKCE verifier in a signed httpOnly cookie.
 */
export async function setOAuthSessionCookie(
  data: Omit<OAuthSessionData, 'expiresAt'>
): Promise<void> {
  const cookieStore = await cookies();
  const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!';
  const expiresAt = Math.floor(Date.now() / 1000) + OAUTH_TTL_SECONDS;

  const fullData: OAuthSessionData = {
    ...data,
    expiresAt,
  };

  const serialized = JSON.stringify(fullData);
  const signature = crypto.createHmac('sha256', secret).update(serialized).digest('hex');
  const value = Buffer.from(JSON.stringify({ data: fullData, sig: signature })).toString('base64url');

  cookieStore.set(OAUTH_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_TTL_SECONDS,
  });
}

/**
 * Retrieves and validates OAuth session data from cookie.
 */
export async function getOAuthSessionCookie(): Promise<OAuthSessionData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(OAUTH_COOKIE_NAME);
    if (!cookie?.value) return null;

    const secret = process.env.AUTH_SESSION_SECRET || 'dev_secret_key_sankobite_auth_32_chars_minimum!';
    const raw = Buffer.from(cookie.value, 'base64url').toString('utf8');
    const { data, sig } = JSON.parse(raw);

    const expectedSig = crypto.createHmac('sha256', secret).update(JSON.stringify(data)).digest('hex');
    if (sig !== expectedSig) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (data.expiresAt < nowSeconds) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Clears the temporary OAuth session cookie.
 */
export async function clearOAuthSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_COOKIE_NAME);
}

/**
 * Exchanges authorization code and PKCE verifier for access tokens.
 */
export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<string> {
  const config = getProviderConfig(provider);

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || `Failed to exchange authorization code with ${provider}.`
    );
  }

  return data.access_token;
}

/**
 * Fetches user profile from provider's identity endpoint.
 */
export async function fetchOAuthUserProfile(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserProfile> {
  const config = getProviderConfig(provider);

  const res = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to retrieve profile from ${provider}: ${data.error || res.statusText}`);
  }

  if (provider === 'google') {
    return {
      provider: 'google',
      providerUserId: String(data.sub),
      email: String(data.email).trim().toLowerCase(),
      displayName: data.name,
    };
  }

  if (provider === 'microsoft') {
    const email = (data.mail || data.userPrincipalName || '').trim().toLowerCase();
    if (!email) {
      throw new Error('No email address associated with this Microsoft account.');
    }
    return {
      provider: 'microsoft',
      providerUserId: String(data.id),
      email,
      displayName: data.displayName,
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export default {
  getProviderConfig,
  generatePKCE,
  generateState,
  setOAuthSessionCookie,
  getOAuthSessionCookie,
  clearOAuthSessionCookie,
  exchangeCodeForToken,
  fetchOAuthUserProfile,
};
