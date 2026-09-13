import { NextRequest, NextResponse } from 'next/server';
import {
  OAuthProvider,
  getProviderConfig,
  generatePKCE,
  generateState,
  setOAuthSessionCookie,
} from '@/lib/oauth';
import { getSessionUser } from '@/lib/auth';
import { execute } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: rawProvider } = await context.params;
    const provider = rawProvider.toLowerCase() as OAuthProvider;

    if (provider !== 'google' && provider !== 'microsoft') {
      return NextResponse.json(
        { error: `Invalid OAuth provider '${rawProvider}'. Must be 'google' or 'microsoft'.` },
        { status: 400 }
      );
    }

    const config = getProviderConfig(provider);

    if (!config.clientId) {
      const varName = provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'MICROSOFT_CLIENT_ID';
      return NextResponse.json(
        {
          error: `OAuth provider '${provider}' is not configured yet.`,
          message: `Please set ${varName} and ${varName.replace('ID', 'SECRET')} in your .env.local file.`,
          setupHelp: {
            provider,
            requiredCallbackUrl: `${request.nextUrl.origin}/api/auth/oauth/${provider}/callback`,
          },
        },
        { status: 501 }
      );
    }

    // Determine action mode: link (authenticated), register, or signin
    const actionParam = request.nextUrl.searchParams.get('action');
    const session = await getSessionUser();
    
    let action: 'signin' | 'link' | 'register' = 'signin';
    let targetSubscriberId: number | undefined = undefined;

    if (actionParam === 'link' || (Boolean(session?.subscriberId) && actionParam !== 'signin' && actionParam !== 'register')) {
      if (!session || !session.subscriberId) {
        return NextResponse.redirect(new URL('/login?error=AuthenticationRequiredForLinking', request.url));
      }
      action = 'link';
      targetSubscriberId = Number(session.subscriberId);
    } else if (actionParam === 'register') {
      action = 'register';
    } else {
      action = 'signin';
    }

    // 1. Generate CSRF state & PKCE parameters
    const state = generateState();
    const { codeVerifier, codeChallenge } = generatePKCE();

    // 2. Store state, codeVerifier, and optional target subscriberId in secure signed httpOnly cookie
    await setOAuthSessionCookie({
      state,
      codeVerifier,
      provider,
      subscriberId: targetSubscriberId,
      action,
    });

    // 3. Compute callback URL
    const redirectUri = `${request.nextUrl.origin}/api/auth/oauth/${provider}/callback`;

    // 4. Build authorization URL
    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', config.scopes.join(' '));
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    if (provider === 'google') {
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'select_account');
    }

    if (provider === 'microsoft') {
      authUrl.searchParams.set('response_mode', 'query');
      authUrl.searchParams.set('prompt', 'select_account');
    }

    return NextResponse.redirect(authUrl.toString());
  } catch (error: unknown) {
    console.error('[API /api/auth/oauth/[provider]] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `OAuth initiation failed: ${detail}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider: rawProvider } = await context.params;
    const provider = rawProvider.toLowerCase() as OAuthProvider;

    if (provider !== 'google' && provider !== 'microsoft') {
      return NextResponse.json({ error: 'Invalid OAuth provider' }, { status: 400 });
    }

    // Delete the linked account for this subscriber
    const result = await execute(
      'DELETE FROM subscriber_oauth_accounts WHERE subscriber_id = ? AND provider = ?',
      [session.subscriberId, provider]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: `No linked ${provider} account found on this subscriber record.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${provider === 'google' ? 'Google' : 'Microsoft'} account successfully unlinked.`,
    });
  } catch (error: unknown) {
    console.error('[API DELETE /api/auth/oauth/[provider]] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Failed to unlink account: ${detail}` }, { status: 500 });
  }
}
