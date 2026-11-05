import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, verifyTOTP } from '@/lib/auth';
import { queryRow } from '@/lib/db';
import { regenerateAndStoreBackupCodes } from '@/lib/totp';

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
      'SELECT totp_secret, is_active FROM totp_credentials WHERE account_id = ? LIMIT 1',
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

    // 3. Activate TOTP and generate 8 single-use emergency backup recovery codes
    const codes = await regenerateAndStoreBackupCodes(session.subscriberId, true);

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
