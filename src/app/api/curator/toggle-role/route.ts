import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, execute, AccountRecord, SystemRole, ArtistDistinctionRole } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const VALID_ROLES = new Set([
  'user',
  'artist',
  'featured',
  'partner',
  'curator',
  'admin',
  // Legacy tier aliases mapped cleanly:
  'artist_resident',
  'illustrator_pro',
  'illustrator',
  'studio-alpha',
  'studio-atelier',
  'enterprise',
  'collector',
  'studio',
  'free',
]);

function mapInputToRoles(input: string): {
  systemRole: SystemRole;
  artistDistinction: ArtistDistinctionRole;
  displayTier: string;
} {
  const clean = input.trim().toLowerCase();
  if (clean === 'partner') {
    return { systemRole: 'curator', artistDistinction: 'partner', displayTier: 'partner' };
  }
  if (clean === 'featured' || clean === 'artist_resident') {
    return { systemRole: 'user', artistDistinction: 'featured', displayTier: 'featured' };
  }
  if (clean === 'artist' || clean === 'illustrator' || clean === 'illustrator_pro') {
    return { systemRole: 'user', artistDistinction: 'artist', displayTier: 'artist' };
  }
  if (clean === 'admin') {
    return { systemRole: 'admin', artistDistinction: 'partner', displayTier: 'admin' };
  }
  if (clean === 'curator') {
    return { systemRole: 'curator', artistDistinction: 'featured', displayTier: 'curator' };
  }
  return { systemRole: 'user', artistDistinction: 'none', displayTier: 'user' };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = await request.json().catch(() => ({}));

    const rawRequested =
      typeof body.role === 'string'
        ? body.role
        : typeof body.tier === 'string'
        ? body.tier
        : '';
    const requestedRole = rawRequested.trim().toLowerCase();

    if (!requestedRole || !VALID_ROLES.has(requestedRole)) {
      return NextResponse.json(
        {
          error: `Invalid role specified. Allowed roles: user, artist, featured, partner, curator, admin.`,
        },
        { status: 400 }
      );
    }

    const { systemRole, artistDistinction, displayTier } = mapInputToRoles(requestedRole);

    let targetEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    let targetAccountId =
      typeof body.accountId === 'number'
        ? body.accountId
        : typeof body.subscriberId === 'number'
        ? body.subscriberId
        : null;

    if (!targetEmail && !targetAccountId) {
      if (session) {
        targetEmail = session.email.toLowerCase();
        targetAccountId = Number(session.accountId ?? session.subscriberId);
      } else {
        return NextResponse.json(
          { error: 'Email or active authentication session is required to toggle curatorial role.' },
          { status: 400 }
        );
      }
    }

    // Look up or initialize account
    let account = targetAccountId
      ? await queryRow<AccountRecord>(
          'SELECT id, email, handle, display_name, system_role, artist_distinction FROM accounts WHERE id = ? LIMIT 1',
          [targetAccountId]
        )
      : null;

    if (!account && targetEmail) {
      account = await queryRow<AccountRecord>(
        'SELECT id, email, handle, display_name, system_role, artist_distinction FROM accounts WHERE email = ? LIMIT 1',
        [targetEmail]
      );
    }

    if (!account && targetEmail) {
      const baseHandle = (targetEmail.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const uniqueHandle = `${baseHandle}_${Math.floor(1000 + Math.random() * 9000)}`;
      const displayName = (targetEmail.split('@')[0] || 'Studio User').replace(/^\w/, (c: string) => c.toUpperCase());

      const insertResult = await execute(
        'INSERT INTO accounts (email, handle, display_name, is_verified, system_role, artist_distinction) VALUES (?, ?, ?, 1, ?, ?)',
        [targetEmail, uniqueHandle, displayName, systemRole, artistDistinction]
      );
      const newId = insertResult.insertId;

      return NextResponse.json({
        success: true,
        message: `Account created and granted ${displayTier} credentials.`,
        account: {
          id: newId,
          email: targetEmail,
          systemRole,
          artistDistinction,
          role: displayTier,
          tier: displayTier,
        },
        subscriber: {
          id: newId,
          email: targetEmail,
          tier: requestedRole,
          role: displayTier,
        },
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Account record not found.' },
        { status: 404 }
      );
    }

    // Update account system_role and artist_distinction on BCNF accounts table
    await execute(
      'UPDATE accounts SET system_role = ?, artist_distinction = ? WHERE id = ?',
      [systemRole, artistDistinction, account.id]
    );

    return NextResponse.json({
      success: true,
      message: `Curatorial ceremony completed: ${account.email} updated to ${displayTier}.`,
      account: {
        id: account.id,
        email: account.email,
        systemRole,
        artistDistinction,
        role: displayTier,
        tier: displayTier,
      },
      subscriber: {
        id: account.id,
        email: account.email,
        tier: requestedRole,
        role: displayTier,
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
