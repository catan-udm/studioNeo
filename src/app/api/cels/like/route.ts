import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, queryRows, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return NextResponse.json({ authenticated: false, likedArtworkIds: [] });
    }

    const likes = await queryRows<{ artwork_id: number }>(
      'SELECT artwork_id FROM artwork_likes WHERE account_id = ?',
      [accountId]
    );

    return NextResponse.json({
      authenticated: true,
      likedArtworkIds: likes.map((l) => l.artwork_id),
    });
  } catch (error) {
    console.error('[API /api/cels/like GET] Error:', error);
    return NextResponse.json({ authenticated: false, likedArtworkIds: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return NextResponse.json(
        { error: 'Please sign in to like artworks.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const artworkId = Number(body.artworkId || body.celId);
    if (!artworkId || isNaN(artworkId)) {
      return NextResponse.json(
        { error: 'Valid artworkId is required.' },
        { status: 400 }
      );
    }

    const existing = await queryRow<{ account_id: number; artwork_id: number }>(
      'SELECT account_id, artwork_id FROM artwork_likes WHERE account_id = ? AND artwork_id = ? LIMIT 1',
      [accountId, artworkId]
    );

    if (existing) {
      await execute(
        'DELETE FROM artwork_likes WHERE account_id = ? AND artwork_id = ?',
        [accountId, artworkId]
      );
      return NextResponse.json({
        success: true,
        liked: false,
        artworkId,
      });
    } else {
      await execute(
        'INSERT INTO artwork_likes (account_id, artwork_id) VALUES (?, ?)',
        [accountId, artworkId]
      );
      return NextResponse.json({
        success: true,
        liked: true,
        artworkId,
      });
    }
  } catch (error) {
    console.error('[API /api/cels/like POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update like status.' },
      { status: 500 }
    );
  }
}
