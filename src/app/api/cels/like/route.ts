import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, queryRows, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return NextResponse.json({ authenticated: false, likedIds: [], likedArtworkIds: [] });
    }

    // 1. Fetch from user_likes (handles all string & composite IDs: sankobite-1, rella-2, snk-01, etc.)
    const userLikes = await queryRows<{ target_id: string }>(
      'SELECT target_id FROM user_likes WHERE account_id = ?',
      [accountId]
    ).catch(() => []);

    // 2. Fetch from artwork_likes (for backwards compatibility with uploaded numeric artworks)
    const artworkLikes = await queryRows<{ artwork_id: number }>(
      'SELECT artwork_id FROM artwork_likes WHERE account_id = ?',
      [accountId]
    ).catch(() => []);

    const likedIdsSet = new Set<string>();
    const likedArtworkIdsSet = new Set<number>();

    for (const row of userLikes) {
      if (row.target_id) {
        likedIdsSet.add(row.target_id);
        const numeric = Number(row.target_id.replace(/^db-artwork-/, ''));
        if (!isNaN(numeric) && numeric > 0) {
          likedArtworkIdsSet.add(numeric);
        }
      }
    }

    for (const row of artworkLikes) {
      if (row.artwork_id) {
        likedArtworkIdsSet.add(row.artwork_id);
        likedIdsSet.add(`db-artwork-${row.artwork_id}`);
        likedIdsSet.add(String(row.artwork_id));
      }
    }

    return NextResponse.json({
      authenticated: true,
      likedIds: Array.from(likedIdsSet),
      likedArtworkIds: Array.from(likedArtworkIdsSet),
    });
  } catch (error) {
    console.error('[API /api/cels/like GET] Error:', error);
    return NextResponse.json({ authenticated: false, likedIds: [], likedArtworkIds: [] });
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
    const rawTarget = body.targetId ?? body.artworkId ?? body.celId ?? body.id ?? body.code;
    if (rawTarget === undefined || rawTarget === null || String(rawTarget).trim() === '') {
      return NextResponse.json(
        { error: 'Valid targetId or artworkId is required.' },
        { status: 400 }
      );
    }

    const targetId = String(rawTarget).trim();
    const numericArtworkId = Number(String(rawTarget).replace(/^db-artwork-/, ''));
    const isNumericArtwork = !isNaN(numericArtworkId) && numericArtworkId > 0;

    // Check if like exists in user_likes
    const existingUserLike = await queryRow<{ account_id: number; target_id: string }>(
      'SELECT account_id, target_id FROM user_likes WHERE account_id = ? AND target_id = ? LIMIT 1',
      [accountId, targetId]
    ).catch(() => null);

    // If it's a numeric artwork, also check artwork_likes
    let existingArtworkLike = null;
    if (isNumericArtwork) {
      existingArtworkLike = await queryRow<{ account_id: number; artwork_id: number }>(
        'SELECT account_id, artwork_id FROM artwork_likes WHERE account_id = ? AND artwork_id = ? LIMIT 1',
        [accountId, numericArtworkId]
      ).catch(() => null);
    }

    const isCurrentlyLiked = Boolean(existingUserLike || existingArtworkLike);

    if (isCurrentlyLiked) {
      // UNLIKE
      await execute(
        'DELETE FROM user_likes WHERE account_id = ? AND target_id = ?',
        [accountId, targetId]
      ).catch(() => {});

      if (isNumericArtwork) {
        await execute(
          'DELETE FROM artwork_likes WHERE account_id = ? AND artwork_id = ?',
          [accountId, numericArtworkId]
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        liked: false,
        targetId,
        artworkId: isNumericArtwork ? numericArtworkId : undefined,
      });
    } else {
      // LIKE
      await execute(
        'INSERT IGNORE INTO user_likes (account_id, target_id) VALUES (?, ?)',
        [accountId, targetId]
      ).catch(() => {});

      if (isNumericArtwork) {
        await execute(
          'INSERT IGNORE INTO artwork_likes (account_id, artwork_id) VALUES (?, ?)',
          [accountId, numericArtworkId]
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        liked: true,
        targetId,
        artworkId: isNumericArtwork ? numericArtworkId : undefined,
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
