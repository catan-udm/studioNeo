import { NextRequest, NextResponse } from 'next/server';
import {
  OAuthProvider,
  getOAuthSessionCookie,
  clearOAuthSessionCookie,
  exchangeCodeForToken,
  fetchOAuthUserProfile,
} from '@/lib/oauth';
import { queryRow, execute, transaction } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider: rawProvider } = await context.params;
    const provider = rawProvider.toLowerCase() as OAuthProvider;

    if (provider !== 'google' && provider !== 'microsoft') {
      return NextResponse.redirect(new URL('/login?error=InvalidProvider', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error(`[OAuth Callback] Provider returned error: ${errorParam}`);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorParam)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=MissingAuthorizationCode', request.url)
      );
    }

    // 1. Verify CSRF state & retrieve PKCE verifier
    const oauthSession = await getOAuthSessionCookie();
    if (!oauthSession || oauthSession.state !== state || oauthSession.provider !== provider) {
      return NextResponse.redirect(
        new URL('/login?error=InvalidOAuthStateOrExpired', request.url)
      );
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/oauth/${provider}/callback`;

    // 2. Exchange authorization code for access token
    const accessToken = await exchangeCodeForToken(
      provider,
      code,
      oauthSession.codeVerifier,
      redirectUri
    );

    // 3. Fetch user profile from provider
    const profile = await fetchOAuthUserProfile(provider, accessToken);

    const isLinkingFlow = oauthSession.action === 'link' && Boolean(oauthSession.subscriberId);

    // 4. Resolve or create subscriber and link account
    const result = await transaction(async (conn) => {
      // -------------------------------------------------------------
      // FLOW A: Account Linking (Authenticated User)
      // -------------------------------------------------------------
      if (oauthSession.action === 'link') {
        const targetId = Number(oauthSession.subscriberId);
        const [targetRows] = await conn.query<any[]>(
          'SELECT id, email, is_verified FROM subscribers WHERE id = ? LIMIT 1',
          [targetId]
        );

        if (!targetRows || targetRows.length === 0) {
          return {
            redirectUrl: `/login?error=${encodeURIComponent('Authenticated subscriber account not found for linking.')}`,
            issueSession: false,
          };
        }

        const targetSub = targetRows[0];

        // Check if this external identity is already connected to an account
        const [existingOAuth] = await conn.query<any[]>(
          'SELECT subscriber_id FROM subscriber_oauth_accounts WHERE provider = ? AND provider_user_id = ? LIMIT 1',
          [provider, profile.providerUserId]
        );

        if (existingOAuth && existingOAuth.length > 0) {
          const prevOwnerId = existingOAuth[0].subscriber_id as number;
          if (prevOwnerId !== targetId) {
            // Re-assign to active account
            await conn.execute(
              'UPDATE subscriber_oauth_accounts SET subscriber_id = ? WHERE provider = ? AND provider_user_id = ?',
              [targetId, provider, profile.providerUserId]
            );

            // Clean up old stub if it has no perks or other credentials
            const [otherOAuth] = await conn.query<any[]>(
              'SELECT id FROM subscriber_oauth_accounts WHERE subscriber_id = ?',
              [prevOwnerId]
            );
            const [otherPerks] = await conn.query<any[]>(
              'SELECT id FROM perk_unlocks WHERE subscriber_id = ?',
              [prevOwnerId]
            );
            if ((!otherOAuth || otherOAuth.length === 0) && (!otherPerks || otherPerks.length === 0)) {
              await conn.execute('DELETE FROM subscribers WHERE id = ?', [prevOwnerId]);
            }
          }
        } else {
          // Link OAuth account to target subscriber
          await conn.execute(
            `INSERT INTO subscriber_oauth_accounts (subscriber_id, provider, provider_user_id)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE subscriber_id = VALUES(subscriber_id)`,
            [targetId, provider, profile.providerUserId]
          );
        }

        await conn.execute('UPDATE subscribers SET is_verified = 1 WHERE id = ?', [targetId]);

        return {
          subscriberId: targetId,
          sessionEmail: targetSub.email as string,
          redirectUrl: `/?linked=${provider}`,
          issueSession: true,
        };
      }

      // -------------------------------------------------------------
      // FLOW B: Registration Mode (Explicit /register)
      // -------------------------------------------------------------
      if (oauthSession.action === 'register') {
        // Strict check: Is this provider ID already registered?
        const [oauthRows] = await conn.query<any[]>(
          'SELECT subscriber_id FROM subscriber_oauth_accounts WHERE provider = ? AND provider_user_id = ? LIMIT 1',
          [provider, profile.providerUserId]
        );

        if (oauthRows && oauthRows.length > 0) {
          return {
            redirectUrl: `/login?error=${encodeURIComponent(
              `An account is already registered with this ${provider} account. Please sign in instead.`
            )}&email=${encodeURIComponent(profile.email)}`,
            issueSession: false,
          };
        }

        // Strict check: Does an account already exist with this email?
        const [subRows] = await conn.query<any[]>(
          'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
          [profile.email]
        );

        if (subRows && subRows.length > 0 && subRows[0].is_verified === 1) {
          return {
            redirectUrl: `/login?error=${encodeURIComponent(
              'An account with this email address already exists. Please sign in instead.'
            )}&email=${encodeURIComponent(profile.email)}`,
            issueSession: false,
          };
        }

        let newSubId: number;
        if (subRows && subRows.length > 0) {
          // Verify previously pending registration
          newSubId = subRows[0].id;
          await conn.execute('UPDATE subscribers SET is_verified = 1 WHERE id = ?', [newSubId]);
        } else {
          // Create new verified subscriber
          const [insertResult] = await conn.execute<any>(
            'INSERT INTO subscribers (email, is_verified) VALUES (?, 1)',
            [profile.email]
          );
          newSubId = insertResult.insertId;
        }

        // Link OAuth account
        await conn.execute(
          `INSERT INTO subscriber_oauth_accounts (subscriber_id, provider, provider_user_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE subscriber_id = VALUES(subscriber_id)`,
          [newSubId, provider, profile.providerUserId]
        );

        return {
          subscriberId: newSubId,
          sessionEmail: profile.email,
          redirectUrl: '/',
          issueSession: true,
        };
      }

      // -------------------------------------------------------------
      // FLOW C: Sign-In Mode (Explicit /login)
      // -------------------------------------------------------------
      const [oauthRows] = await conn.query<any[]>(
        'SELECT subscriber_id FROM subscriber_oauth_accounts WHERE provider = ? AND provider_user_id = ? LIMIT 1',
        [provider, profile.providerUserId]
      );

      if (oauthRows && oauthRows.length > 0) {
        const subId = oauthRows[0].subscriber_id as number;
        const [subRows] = await conn.query<any[]>(
          'SELECT id, email, is_verified FROM subscribers WHERE id = ? LIMIT 1',
          [subId]
        );

        if (subRows && subRows.length > 0) {
          if (subRows[0].is_verified !== 1) {
            return {
              redirectUrl: `/register?error=${encodeURIComponent(
                'This account registration is pending verification. Please complete registration first.'
              )}&email=${encodeURIComponent(subRows[0].email)}`,
              issueSession: false,
            };
          }

          return {
            subscriberId: subId,
            sessionEmail: subRows[0].email as string,
            redirectUrl: '/',
            issueSession: true,
          };
        }
      }

      // Check if subscriber exists with this email for auto-linking on sign-in
      const [subRows] = await conn.query<any[]>(
        'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
        [profile.email]
      );

      if (subRows && subRows.length > 0) {
        const subId = subRows[0].id;
        const email = subRows[0].email;

        // Auto-link provider to existing verified subscriber
        await conn.execute('UPDATE subscribers SET is_verified = 1 WHERE id = ?', [subId]);
        await conn.execute(
          `INSERT INTO subscriber_oauth_accounts (subscriber_id, provider, provider_user_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE subscriber_id = VALUES(subscriber_id)`,
          [subId, provider, profile.providerUserId]
        );

        return {
          subscriberId: subId,
          sessionEmail: email,
          redirectUrl: '/',
          issueSession: true,
        };
      }

      // Strict Check: No account exists -> redirect to register
      return {
        redirectUrl: `/register?error=${encodeURIComponent(
          `No account found for ${profile.email}. Please register as a subscriber first.`
        )}&email=${encodeURIComponent(profile.email)}`,
        issueSession: false,
      };
    });

    await clearOAuthSessionCookie();

    if (result.issueSession && result.subscriberId && result.sessionEmail) {
      // 5. Issue session cookie
      const token = createSessionToken({
        subscriberId: result.subscriberId,
        email: result.sessionEmail,
        isVerified: true,
      });

      await setSessionCookie(token);
    }

    // Redirect to destination
    return NextResponse.redirect(new URL(result.redirectUrl, request.url));
  } catch (error: unknown) {
    console.error('[API /api/auth/oauth/[provider]/callback] Error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown OAuth Error';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(detail)}`, request.url)
    );
  }
}
