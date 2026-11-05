import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, createSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/auth';
import { queryRow, queryRows, transaction, AccountRecord } from '@/lib/db';
import { clearPasskeyChallenge } from '@/lib/webauthn';
import { clearOAuthSessionCookie } from '@/lib/oauth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function jsonWithNoCache(data: unknown, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.headers.set('Pragma', 'no-cache');
  res.headers.set('Expires', '0');
  return res;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return jsonWithNoCache({ authenticated: false, subscriber: null, account: null, perks: [] });
    }

    const account = await queryRow<AccountRecord>(
      'SELECT id, email, handle, display_name, avatar_url, bio, website_url, is_verified, system_role, artist_distinction, created_at FROM accounts WHERE id = ? LIMIT 1',
      [accountId]
    );

    if (!account) {
      return jsonWithNoCache({ authenticated: false, subscriber: null, account: null, perks: [] });
    }

    // Check if 2FA is active
    let twoFactorActive = false;
    try {
      const totp = await queryRow<{ is_active: number }>(
        'SELECT is_active FROM totp_credentials WHERE account_id = ? LIMIT 1',
        [account.id]
      );
      twoFactorActive = totp?.is_active === 1;
    } catch {}

    // Fetch linked OAuth providers
    let linkedOAuth: string[] = [];
    let linkedAccounts: Array<{ provider: string; created_at: string }> = [];
    try {
      const oauthRows = await queryRows<{ provider: string; created_at: string }>(
        'SELECT provider, created_at FROM account_oauth_providers WHERE account_id = ?',
        [account.id]
      );
      linkedOAuth = oauthRows.map((r) => r.provider);
      linkedAccounts = oauthRows.map((r) => ({
        provider: r.provider,
        created_at: r.created_at,
      }));
    } catch {
      // Table may not exist yet
    }

    // Fetch passkeys count
    let passkeyCount = 0;
    try {
      const passkeyRows = await queryRows<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM webauthn_credentials WHERE account_id = ?',
        [account.id]
      );
      passkeyCount = Number(passkeyRows[0]?.cnt || 0);
    } catch {
      // Table may not exist yet
    }

    const derivedRole =
      account.artist_distinction !== 'none'
        ? account.artist_distinction
        : account.system_role;

    const userPayload = {
      id: account.id,
      email: account.email,
      handle: account.handle,
      displayName: account.display_name,
      avatarUrl: account.avatar_url,
      bio: account.bio,
      websiteUrl: account.website_url,
      is_verified: account.is_verified === 1,
      systemRole: account.system_role,
      artistDistinction: account.artist_distinction,
      role: derivedRole,
      tier: derivedRole,
      twoFactorActive,
      passkeyCount,
      linkedOAuth,
      linkedAccounts,
      created_at: account.created_at,
    };

    // Issue refreshed token to sustain session activity
    const token = createSessionToken({
      subscriberId: account.id,
      accountId: account.id,
      email: account.email,
      role: account.system_role,
      tier: account.system_role,
      isVerified: account.is_verified === 1,
    });

    const res = jsonWithNoCache({
      authenticated: true,
      account: userPayload,
      subscriber: userPayload,
      perks: [],
      token,
    });

    await setSessionCookie(token, res);

    return res;
  } catch (error) {
    console.error('[API /api/auth/me] Error:', error);
    return jsonWithNoCache(
      { error: 'Failed to retrieve session status' },
      500
    );
  }
}

/**
 * Permanently deletes the authenticated user's account and all associated personal data.
 * GDPR Right to be Forgotten compliant with confirmation verification.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to delete your account.' },
        { status: 401 }
      );
    }

    let confirmEmail = '';
    try {
      const body = await request.json();
      confirmEmail = body.confirmEmail?.trim().toLowerCase() || '';
    } catch {
      // Body may be missing or empty
    }

    if (!confirmEmail || confirmEmail !== session.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: `Confirmation failed. Please type your full email address (${session.email}) to confirm permanent deletion.`,
        },
        { status: 400 }
      );
    }

    // Atomic transaction: delete account (cascades to all BCNF child tables)
    await transaction(async (conn) => {
      await conn.execute('DELETE FROM accounts WHERE id = ?', [accountId]);
    });

    // Clear session and challenge cookies
    await clearSessionCookie();
    await clearPasskeyChallenge();
    await clearOAuthSessionCookie();

    return NextResponse.json(
      {
        success: true,
        message: 'Your account and all associated personal data have been permanently deleted.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API DELETE /api/auth/me] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to delete account: ${detail}` },
      { status: 500 }
    );
  }
}
