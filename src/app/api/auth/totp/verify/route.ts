import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, verifyTOTP } from '@/lib/auth';
import { queryRow, transaction } from '@/lib/db';
import { generateBackupCodes } from '@/lib/totp';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to verify two-factor authentication.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token || token.length < 6) {
      return NextResponse.json(
        { error: 'A valid 6-digit authenticator code is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch pending TOTP record
    const totpRecord = await queryRow<{ totp_secret: string; is_active: number }>(
      'SELECT totp_secret, is_active FROM totp_credentials WHERE subscriber_id = ? LIMIT 1',
      [session.subscriberId]
    );

    if (!totpRecord || !totpRecord.totp_secret) {
      return NextResponse.json(
        { error: 'No pending TOTP configuration found. Please start setup again.' },
        { status: 400 }
      );
    }

    // 2. Validate rolling 30-second RFC 6238 code with drift tolerance
    const isValid = verifyTOTP(totpRecord.totp_secret, token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid authentication code. Ensure your device clock is synchronized.' },
        { status: 400 }
      );
    }

    // 3. Generate 8 single-use emergency backup recovery codes
    const { codes, hashedCodes } = generateBackupCodes(8);

    // 4. Atomic transaction: activate TOTP and store hashed backup codes
    await transaction(async (conn) => {
      // Activate credential
      await conn.execute(
        'UPDATE totp_credentials SET is_active = 1, updated_at = NOW() WHERE subscriber_id = ?',
        [session.subscriberId]
      );

      // Invalidate any older backup codes
      await conn.execute(
        'DELETE FROM totp_backup_codes WHERE subscriber_id = ?',
        [session.subscriberId]
      );

      // Insert fresh hashed backup codes
      for (const hash of hashedCodes) {
        await conn.execute(
          'INSERT INTO totp_backup_codes (subscriber_id, code_hash, is_used) VALUES (?, ?, 0)',
          [session.subscriberId, hash]
        );
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Two-Factor Authentication (TOTP) successfully activated!',
        backupCodes: codes,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/totp/verify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify and activate TOTP credential.' },
      { status: 500 }
    );
  }
}
