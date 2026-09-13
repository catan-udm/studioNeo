import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute, transaction } from '@/lib/db';
import {
  hashToken,
  timingSafeCompare,
  verifyTOTP,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';

interface VerifyOTPRequestBody {
  email?: string;
  otp?: string;
  totpCode?: string;
  backupCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequestBody = await request.json();
    const { email: rawEmail, otp: rawOtp, totpCode, backupCode } = body;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    if (!rawOtp || typeof rawOtp !== 'string') {
      return NextResponse.json(
        { error: 'A 6-digit verification OTP code is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    const otp = rawOtp.trim();

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'Verification code must be exactly 6 digits.' },
        { status: 422 }
      );
    }

    // 1. Fetch subscriber
    const subscriber = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
      [email]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'No subscriber record found for this email address.' },
        { status: 404 }
      );
    }

    // 2. Lookup latest active, unconsumed token
    const magicToken = await queryRow<{
      id: number;
      token_hash: string;
      expires_at: string;
    }>(
      `SELECT id, token_hash, expires_at 
       FROM auth_magic_tokens 
       WHERE subscriber_id = ? 
         AND consumed_at IS NULL 
         AND expires_at >= NOW()
       ORDER BY id DESC 
       LIMIT 1`,
      [subscriber.id]
    );

    if (!magicToken) {
      return NextResponse.json(
        { error: 'Verification code has expired or has already been used. Please request a new code.' },
        { status: 401 }
      );
    }

    // 3. Verify OTP hash with timing safe equality
    const submittedHash = hashToken(otp);
    if (!timingSafeCompare(magicToken.token_hash, submittedHash)) {
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 401 }
      );
    }

    // 4. TOTP 2FA Verification (if active on the account)
    const totpRecord = await queryRow<{ totp_secret: string; is_active: number }>(
      'SELECT totp_secret, is_active FROM totp_credentials WHERE subscriber_id = ? AND is_active = 1 LIMIT 1',
      [subscriber.id]
    );

    if (totpRecord && totpRecord.is_active === 1) {
      // 2FA is required for this subscriber
      if (!totpCode && !backupCode) {
        return NextResponse.json(
          {
            requires2FA: true,
            message: 'Two-factor authentication code or backup code is required.',
          },
          { status: 200 }
        );
      }

      let is2faValid = false;

      if (totpCode) {
        is2faValid = verifyTOTP(totpRecord.totp_secret, totpCode);
      } else if (backupCode) {
        const backupHash = hashToken(backupCode.trim());
        const matchedBackup = await queryRow<{ id: number }>(
          'SELECT id FROM totp_backup_codes WHERE subscriber_id = ? AND code_hash = ? AND is_used = 0 LIMIT 1',
          [subscriber.id, backupHash]
        );

        if (matchedBackup) {
          is2faValid = true;
          // Consume the single-use backup code
          await execute(
            'UPDATE totp_backup_codes SET is_used = 1, used_at = NOW() WHERE id = ?',
            [matchedBackup.id]
          );
        }
      }

      if (!is2faValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA authenticator code or backup code.' },
          { status: 401 }
        );
      }
    }

    // 5. Atomic state update: consume OTP token and mark subscriber verified
    await transaction(async (conn) => {
      await conn.execute(
        'UPDATE auth_magic_tokens SET consumed_at = NOW() WHERE id = ?',
        [magicToken.id]
      );
      await conn.execute(
        'UPDATE subscribers SET is_verified = 1 WHERE id = ?',
        [subscriber.id]
      );
    });

    // 6. Issue secure httpOnly, SameSite=Lax session token
    const sessionToken = createSessionToken({
      subscriberId: subscriber.id,
      email: subscriber.email,
      isVerified: true,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful.',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          is_verified: 1,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/verify-otp] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while verifying the code.' },
      { status: 500 }
    );
  }
}
