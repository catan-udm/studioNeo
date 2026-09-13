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

    return NextResponse.json({
      authenticated: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        is_verified: subscriber.is_verified === 1,
        twoFactorActive: totp?.is_active === 1,
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
