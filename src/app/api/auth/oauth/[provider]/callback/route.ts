import { NextRequest, NextResponse } from 'next/server';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import {
  OAuthProvider,
  getOAuthSessionCookie,
  clearOAuthSessionCookie,
  exchangeCodeForToken,
  fetchOAuthUserProfile,
  getBaseUrl,
  getOAuthRedirectUri,
} from '@/lib/oauth';
import { transaction } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  try {
    const baseUrl = getBaseUrl(request);
    const { provider: rawProvider } = await context.params;
    const provider = rawProvider.toLowerCase() as OAuthProvider;

    if (provider !== 'google' && provider !== 'microsoft') {
      return NextResponse.redirect(new URL('/login?error=InvalidProvider', baseUrl));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error(`[OAuth Callback] Provider returned error: ${errorParam}`);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorParam)}`, baseUrl)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=MissingAuthorizationCode', baseUrl)
      );
    }

    // 1. Verify CSRF state & retrieve PKCE verifier
    const oauthSession = await getOAuthSessionCookie();
    if (!oauthSession || oauthSession.state !== state || oauthSession.provider !== provider) {
      return NextResponse.redirect(
        new URL('/login?error=InvalidOAuthStateOrExpired', baseUrl)
      );
    }

    const redirectUri = getOAuthRedirectUri(provider, request);

    // 2. Exchange authorization code for access token
    const accessToken = await exchangeCodeForToken(
      provider,
      code,
      oauthSession.codeVerifier,
      redirectUri
    );

    // 3. Fetch user profile from provider
    const profile = await fetchOAuthUserProfile(provider, accessToken);

    // 4. Resolve or create account and link provider
    const result = await transaction(async (conn) => {
      // -------------------------------------------------------------
      // FLOW A: Account Linking (Authenticated User)
      // -------------------------------------------------------------
      if (oauthSession.action === 'link') {
        const targetId = Number(oauthSession.subscriberId);
        const [targetRows] = await conn.query<RowDataPacket[]>(
          'SELECT id, email, is_verified FROM accounts WHERE id = ? LIMIT 1',
          [targetId]
        );

        if (!targetRows || targetRows.length === 0) {
          return {
            redirectUrl: `/login?error=${encodeURIComponent('Authenticated account not found for linking.')}`,
            issueSession: false,
          };
        }

        const targetAcc = targetRows[0];

        // Check if this external identity is already connected to an account
        const [existingOAuth] = await conn.query<RowDataPacket[]>(
          'SELECT account_id FROM account_oauth_providers WHERE provider = ? AND provider_user_id = ? LIMIT 1',
          [provider, profile.providerUserId]
        );

        if (existingOAuth && existingOAuth.length > 0) {
          const prevOwnerId = existingOAuth[0].account_id as number;
          if (prevOwnerId !== targetId) {
            await conn.execute(
              'UPDATE account_oauth_providers SET account_id = ? WHERE provider = ? AND provider_user_id = ?',
              [targetId, provider, profile.providerUserId]
            );

            // Clean up old stub if it has no other OAuth links
            const [otherOAuth] = await conn.query<RowDataPacket[]>(
              'SELECT id FROM account_oauth_providers WHERE account_id = ?',
              [prevOwnerId]
            );
            if (!otherOAuth || otherOAuth.length === 0) {
              await conn.execute('DELETE FROM accounts WHERE id = ?', [prevOwnerId]);
            }
          }
        } else {
          await conn.execute(
            `INSERT INTO account_oauth_providers (account_id, provider, provider_user_id)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE account_id = VALUES(account_id)`,
            [targetId, provider, profile.providerUserId]
          );
        }

        await conn.execute('UPDATE accounts SET is_verified = 1 WHERE id = ?', [targetId]);

        return {
          subscriberId: targetId,
          sessionEmail: targetAcc.email as string,
          redirectUrl: `/?linked=${provider}`,
          issueSession: true,
        };
      }

      // -------------------------------------------------------------
      // FLOW B: Registration Mode (Explicit /register)
      // -------------------------------------------------------------
      if (oauthSession.action === 'register') {
        const [oauthRows] = await conn.query<RowDataPacket[]>(
          'SELECT account_id FROM account_oauth_providers WHERE provider = ? AND provider_user_id = ? LIMIT 1',
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

        const [accRows] = await conn.query<RowDataPacket[]>(
          'SELECT id, email, is_verified FROM accounts WHERE email = ? LIMIT 1',
          [profile.email]
        );

        if (accRows && accRows.length > 0 && (accRows[0].is_verified as number) === 1) {
          return {
            redirectUrl: `/login?error=${encodeURIComponent(
              'An account with this email address already exists. Please sign in instead.'
            )}&email=${encodeURIComponent(profile.email)}`,
            issueSession: false,
          };
        }

        let newAccId: number;
        if (accRows && accRows.length > 0) {
          newAccId = accRows[0].id as number;
          await conn.execute('UPDATE accounts SET is_verified = 1 WHERE id = ?', [newAccId]);
        } else {
          const baseHandle = (profile.email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const uniqueHandle = `${baseHandle}_${Math.floor(1000 + Math.random() * 9000)}`;
          const displayName = profile.email.split('@')[0] || 'Studio User';

          const [insertResult] = await conn.execute<ResultSetHeader>(
            'INSERT INTO accounts (email, handle, display_name, is_verified, system_role, artist_distinction) VALUES (?, ?, ?, ?, ?, ?)',
            [profile.email, uniqueHandle, displayName, 1, 'user', 'none']
          );
          newAccId = insertResult.insertId;
        }

        await conn.execute(
          `INSERT INTO account_oauth_providers (account_id, provider, provider_user_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE account_id = VALUES(account_id)`,
          [newAccId, provider, profile.providerUserId]
        );

        return {
          subscriberId: newAccId,
          sessionEmail: profile.email,
          redirectUrl: '/',
          issueSession: true,
        };
      }

      // -------------------------------------------------------------
      // FLOW C: Sign-In Mode (Explicit /login)
      // -------------------------------------------------------------
      const [oauthRows] = await conn.query<RowDataPacket[]>(
        'SELECT account_id FROM account_oauth_providers WHERE provider = ? AND provider_user_id = ? LIMIT 1',
        [provider, profile.providerUserId]
      );

      if (oauthRows && oauthRows.length > 0) {
        const accId = oauthRows[0].account_id as number;
        const [accRows] = await conn.query<RowDataPacket[]>(
          'SELECT id, email, is_verified FROM accounts WHERE id = ? LIMIT 1',
          [accId]
        );

        if (accRows && accRows.length > 0) {
          if ((accRows[0].is_verified as number) !== 1) {
            return {
              redirectUrl: `/register?error=${encodeURIComponent(
                'This account registration is pending verification. Please complete registration first.'
              )}&email=${encodeURIComponent(accRows[0].email as string)}`,
              issueSession: false,
            };
          }

          return {
            subscriberId: accId,
            sessionEmail: accRows[0].email as string,
            redirectUrl: '/',
            issueSession: true,
          };
        }
      }

      // Check if account exists with this email for auto-linking on sign-in
      const [accRows] = await conn.query<RowDataPacket[]>(
        'SELECT id, email, is_verified FROM accounts WHERE email = ? LIMIT 1',
        [profile.email]
      );

      if (accRows && accRows.length > 0) {
        const accId = accRows[0].id as number;
        const email = accRows[0].email as string;

        await conn.execute('UPDATE accounts SET is_verified = 1 WHERE id = ?', [accId]);
        await conn.execute(
          `INSERT INTO account_oauth_providers (account_id, provider, provider_user_id)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE account_id = VALUES(account_id)`,
          [accId, provider, profile.providerUserId]
        );

        return {
          subscriberId: accId,
          sessionEmail: email,
          redirectUrl: '/',
          issueSession: true,
        };
      }

      return {
        redirectUrl: `/register?error=${encodeURIComponent(
          `No account found for ${profile.email}. Please register an account first.`
        )}&email=${encodeURIComponent(profile.email)}`,
        issueSession: false,
      };
    });

    await clearOAuthSessionCookie();

    if (result.issueSession && result.subscriberId && result.sessionEmail) {
      const token = createSessionToken({
        subscriberId: result.subscriberId,
        accountId: result.subscriberId,
        email: result.sessionEmail,
        isVerified: true,
      });

      await setSessionCookie(token);
    }

    return NextResponse.redirect(new URL(result.redirectUrl, baseUrl));
  } catch (error: unknown) {
    console.error('[API /api/auth/oauth/[provider]/callback] Error:', error);
    const detail = error instanceof Error ? error.message : 'Unknown OAuth Error';
    const fallbackBaseUrl = getBaseUrl(request);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(detail)}`, fallbackBaseUrl)
    );
  }
}
