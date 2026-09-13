import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export type OAuthProvider = 'google' | 'microsoft';

const OAUTH_COOKIE_NAME = 'oauth_session';
const OAUTH_TTL_SECONDS = 600; // 10 minutes

/**
 * Resolves the canonical public base URL of the application.
 * Precedence:
 * 1. APP_URL (e.g. https://ashy-mushroom-07675a400.6.azurestaticapps.net)
 * 2. NEXT_PUBLIC_APP_URL
 * 3. BASE_URL
 * 4. Reverse proxy headers forwarded by Azure Static Web Apps:
 *    - X-Forwarded-Host (with X-Forwarded-Proto)
 *    - X-Original-Host
 * 5. Incoming Host header (ignoring raw internal container hostnames like 60c17d9af36d:8080)
 * 6. Local development fallbacks (http://localhost:8080, http://localhost:4280 for SWA CLI, or http://localhost:3000)
 */
export function getBaseUrl(request?: NextRequest): string {
  // 1. Check explicit environment variables (APP_URL, NEXT_PUBLIC_APP_URL, BASE_URL)
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (request) {
    // 2. Trust reverse proxy headers forwarded by Azure Static Web Apps
    const forwardedHost =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('x-original-host');
    const forwardedProto =
      request.headers.get('x-forwarded-proto') || 'https';

    if (forwardedHost) {
      // Pick first host if comma-separated
      const primaryHost = forwardedHost.split(',')[0].trim();
      return `${forwardedProto}://${primaryHost}`.replace(/\/+$/, '');
    }

    // 3. Inspect Host header
    const host = request.headers.get('host');
    if (host) {
      const hostnameOnly = host.split(':')[0].trim();
      // Detect Docker/Kubernetes container ID (e.g., 12+ hex characters without dots, e.g. 60c17d9af36d)
      const isContainerHost =
        /^[0-9a-f]{12,}$/i.test(hostnameOnly) ||
        (!hostnameOnly.includes('.') && !hostnameOnly.includes('localhost'));

      if (!isContainerHost) {
        const proto =
          request.headers.get('x-forwarded-proto') ||
          (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
        return `${proto}://${host}`.replace(/\/+$/, '');
      }
    }
  }

  // 4. Sensible local fallback based on PORT or SWA CLI default
  if (process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }
  if (process.env.SWA_CLI_PORT) {
    return `http://localhost:${process.env.SWA_CLI_PORT}`;
  }

  return 'http://localhost:3000';
}

/**
 * Constructs the absolute OAuth callback redirect URI for a provider.
 * Guaranteed to resolve to ${APP_URL}/api/auth/oauth/${provider}/callback in production.
 */
export function getOAuthRedirectUri(provider: OAuthProvider, request?: NextRequest): string {
  const baseUrl = getBaseUrl(request);
  return `${baseUrl}/api/auth/oauth/${provider}/callback`;
}

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
  const isProd = process.env.NODE_ENV === 'production';
  cookieStore.delete({
    name: OAUTH_COOKIE_NAME,
    path: '/',
  });
  cookieStore.set(OAUTH_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
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
