import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, queryRows } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json({ authenticated: false, subscriber: null, perks: [] });
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
      return NextResponse.json({ authenticated: false, subscriber: null, perks: [] });
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

    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to retrieve session status' },
      { status: 500 }
    );
  }
}
