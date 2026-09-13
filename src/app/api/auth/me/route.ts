import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, clearSessionCookie } from '@/lib/auth';
import { queryRow, queryRows, transaction } from '@/lib/db';
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

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return jsonWithNoCache({ authenticated: false, subscriber: null, perks: [] });
    }

    const subscriber = await queryRow<{
      id: number;
      email: string;
      is_verified: number;
      created_at: string;
    }>(
      'SELECT id, email, is_verified, created_at FROM subscribers WHERE id = ? LIMIT 1',
      [session.subscriberId]
    );

    if (!subscriber) {
      return jsonWithNoCache({ authenticated: false, subscriber: null, perks: [] });
    }

    // Check if 2FA is active
    const totp = await queryRow<{ is_active: number }>(
      'SELECT is_active FROM totp_credentials WHERE subscriber_id = ? LIMIT 1',
      [subscriber.id]
    );

    // Fetch unlocked perks for this subscriber
    const unlockedPerks = await queryRows<{
      id: number;
      slug: string;
      title: string;
      description: string;
      unlocked_at: string;
    }>(
      `SELECT p.id, p.slug, p.title, p.description, pu.unlocked_at
       FROM perks p
       INNER JOIN perk_unlocks pu ON pu.perk_id = p.id
       WHERE pu.subscriber_id = ?
       ORDER BY pu.unlocked_at DESC`,
      [subscriber.id]
    );

    // Fetch linked OAuth providers
    let linkedOAuth: string[] = [];
    let linkedAccounts: Array<{ provider: string; created_at: string }> = [];
    try {
      const oauthRows = await queryRows<{ provider: string; created_at: string }>(
        'SELECT provider, created_at FROM subscriber_oauth_accounts WHERE subscriber_id = ?',
        [subscriber.id]
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
        'SELECT COUNT(*) as cnt FROM webauthn_credentials WHERE subscriber_id = ?',
        [subscriber.id]
      );
      passkeyCount = Number(passkeyRows[0]?.cnt || 0);
    } catch {
      // Table may not exist yet
    }

    return jsonWithNoCache({
      authenticated: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        is_verified: subscriber.is_verified === 1,
        twoFactorActive: totp?.is_active === 1,
        passkeyCount,
        linkedOAuth,
        linkedAccounts,
        created_at: subscriber.created_at,
      },
      perks: unlockedPerks,
    });
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
    if (!session || !session.subscriberId) {
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

    // Atomic transaction: clean up any orders then delete subscriber (cascades to all child tables)
    await transaction(async (conn) => {
      // 1. Delete associated order items for any subscriber orders
      try {
        await conn.execute(
          `DELETE oi FROM order_items oi
           INNER JOIN orders o ON o.id = oi.order_id
           WHERE o.subscriber_id = ?`,
          [session.subscriberId]
        );
      } catch {
        // Table may not exist or have orders
      }

      // 2. Delete orders
      try {
        await conn.execute('DELETE FROM orders WHERE subscriber_id = ?', [session.subscriberId]);
      } catch {
        // Table may not exist or have orders
      }

      // 3. Delete subscriber record (foreign keys cascade to webauthn_credentials,
      // subscriber_oauth_accounts, auth_magic_tokens, totp_credentials, totp_backup_codes,
      // perk_unlocks, customer_addresses, submissions)
      await conn.execute('DELETE FROM subscribers WHERE id = ?', [session.subscriberId]);
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
