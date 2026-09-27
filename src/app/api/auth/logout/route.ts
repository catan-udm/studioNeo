import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, AUTH_COOKIE_NAME } from '@/lib/auth';
import { clearPasskeyChallenge } from '@/lib/webauthn';
import { clearOAuthSessionCookie, getBaseUrl } from '@/lib/oauth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function applyLogoutCookiesAndHeaders(response: NextResponse): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';

  // Explicitly wipe cookies on the response object with root path
  const cookiesToClear = [
    AUTH_COOKIE_NAME,
    'sanko_auth_session',
    'oauth_session',
    'passkey_challenge',
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
    });
    response.cookies.delete({
      name,
      path: '/',
    });
  }

  // Prevent any browser or CDN caching
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export async function POST(_request: NextRequest) {
  await clearSessionCookie();
  await clearPasskeyChallenge();
  await clearOAuthSessionCookie();

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  return applyLogoutCookiesAndHeaders(response);
}

export async function GET(request: NextRequest) {
  await clearSessionCookie();
  await clearPasskeyChallenge();
  await clearOAuthSessionCookie();

  const baseUrl = getBaseUrl(request);
  const response = NextResponse.redirect(new URL('/login?notice=LoggedOut', baseUrl));

  return applyLogoutCookiesAndHeaders(response);
}
