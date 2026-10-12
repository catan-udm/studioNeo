import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

const VALID_TIERS = new Set([
  'artist_resident',
  'illustrator_pro',
  'artist',
  'illustrator',
  'studio-alpha',
  'studio-atelier',
  'enterprise',
  'collector',
  'studio',
  'free',
]);

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const requestedTier = typeof body.tier === 'string' ? body.tier.trim().toLowerCase() : '';
    if (!requestedTier || !VALID_TIERS.has(requestedTier)) {
      return NextResponse.json(
        {
          error: `Invalid tier specified. Allowed tiers: ${Array.from(VALID_TIERS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    let targetEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    let targetSubscriberId = typeof body.subscriberId === 'number' ? body.subscriberId : null;

    if (!targetEmail && !targetSubscriberId) {
      if (session) {
        targetEmail = session.email.toLowerCase();
        targetSubscriberId = Number(session.subscriberId);
      } else {
        return NextResponse.json(
          { error: 'Email or active authentication session is required to toggle curatorial role.' },
          { status: 400 }
        );
      }
    }

    // Look up or initialize subscriber
    let subscriber = targetSubscriberId
      ? await queryRow<{ id: number; email: string; tier: string }>(
          'SELECT id, email, tier FROM subscribers WHERE id = ? LIMIT 1',
          [targetSubscriberId]
        )
      : null;

    if (!subscriber && targetEmail) {
      subscriber = await queryRow<{ id: number; email: string; tier: string }>(
        'SELECT id, email, tier FROM subscribers WHERE email = ? LIMIT 1',
        [targetEmail]
      );
    }

    if (!subscriber && targetEmail) {
      // Register subscriber with specified tier and verified status
      const insertResult = await execute(
        'INSERT INTO subscribers (email, is_verified) VALUES (?, 1)',
        [targetEmail, 1]
      );
      const newId = insertResult.insertId;
      await execute('UPDATE subscribers SET tier = ? WHERE id = ?', [requestedTier, newId]);

      return NextResponse.json({
        success: true,
        message: `Subscriber account created and granted ${requestedTier} credentials.`,
        subscriber: {
          id: newId,
          email: targetEmail,
          tier: requestedTier,
        },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber record not found.' },
        { status: 404 }
      );
    }

    // Update subscriber tier
    await execute('UPDATE subscribers SET tier = ? WHERE id = ?', [requestedTier, subscriber.id]);

    return NextResponse.json({
      success: true,
      message: `Curatorial ceremony completed: ${subscriber.email} updated to ${requestedTier}.`,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        tier: requestedTier,
      },
    });
  } catch (error: unknown) {
    console.error('[API /api/curator/toggle-role] Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle curatorial role' },
      { status: 500 }
    );
  }
}
