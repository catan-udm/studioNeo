import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, verifyTOTP, hashToken } from '@/lib/auth';
import { normalizeBackupCode } from '@/lib/totp';
import { queryRow, transaction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to manage security settings.' },
        { status: 401 }
      );
    }

    let code: string | undefined;
    try {
      const body = await request.json();
      code = body.code ? String(body.code).trim() : undefined;
    } catch {
      // Body may be empty if simple confirmation
    }

    // Check if TOTP is currently active
    const totpRecord = await queryRow<{ totp_secret: string; is_active: number }>(
      'SELECT totp_secret, is_active FROM totp_credentials WHERE subscriber_id = ? LIMIT 1',
      [session.subscriberId]
    );

    if (!totpRecord || totpRecord.is_active !== 1) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not active on this account.' },
        { status: 400 }
      );
    }

    // If verification code is supplied, check it (either rolling TOTP or single-use backup code)
    if (code) {
      let isCodeValid = verifyTOTP(totpRecord.totp_secret, code);
      if (!isCodeValid) {
        const hash = hashToken(normalizeBackupCode(code));
        const backupRow = await queryRow<{ id: number }>(
          'SELECT id FROM totp_backup_codes WHERE subscriber_id = ? AND code_hash = ? AND is_used = 0 LIMIT 1',
          [session.subscriberId, hash]
        );
        if (backupRow) isCodeValid = true;
      }

      if (!isCodeValid) {
        return NextResponse.json(
          { error: 'Invalid authenticator or backup code.' },
          { status: 400 }
        );
      }
    }

    // Atomic transaction: disable credential and purge recovery codes
    await transaction(async (conn) => {
      await conn.execute(
        'DELETE FROM totp_credentials WHERE subscriber_id = ?',
        [session.subscriberId]
      );
      await conn.execute(
        'DELETE FROM totp_backup_codes WHERE subscriber_id = ?',
        [session.subscriberId]
      );
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Two-Factor Authentication (TOTP) has been deactivated.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/totp/disable] Error:', error);
    return NextResponse.json(
      { error: 'Failed to disable two-factor authentication.' },
      { status: 500 }
    );
  }
}
