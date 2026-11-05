import { NextRequest, NextResponse } from 'next/server';
import { queryRow, transaction } from '@/lib/db';
import {
  hashToken,
  timingSafeCompare,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { verifyTotpOrBackupCode } from '@/lib/totp';

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

    // 1. Fetch account
    const account = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM accounts WHERE email = ? LIMIT 1',
      [email]
    );

    if (!account) {
      return NextResponse.json(
        { error: 'No account record found for this email address.' },
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
       WHERE account_id = ? 
         AND consumed_at IS NULL 
         AND expires_at >= NOW()
       ORDER BY id DESC 
       LIMIT 1`,
      [account.id]
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
      'SELECT totp_secret, is_active FROM totp_credentials WHERE account_id = ? AND is_active = 1 LIMIT 1',
      [account.id]
    );

    if (totpRecord && totpRecord.is_active === 1) {
      // 2FA is required for this account
      if (!totpCode && !backupCode) {
        return NextResponse.json(
          {
            requires2FA: true,
            message: 'Two-factor authentication code or backup code is required.',
          },
          { status: 200 }
        );
      }

      const supplied2faCode = (totpCode || backupCode || '').trim();
      const is2faValid = await verifyTotpOrBackupCode(
        account.id,
        totpRecord.totp_secret,
        supplied2faCode,
        true
      );

      if (!is2faValid) {
        return NextResponse.json(
          { error: 'Invalid 2FA authenticator code or backup code.' },
          { status: 401 }
        );
      }
    }

    // 5. Atomic state update: consume OTP token and mark account verified
    await transaction(async (conn) => {
      await conn.execute(
        'UPDATE auth_magic_tokens SET consumed_at = NOW() WHERE id = ?',
        [magicToken.id]
      );
      await conn.execute(
        'UPDATE accounts SET is_verified = 1 WHERE id = ?',
        [account.id]
      );
    });

    // 6. Issue secure httpOnly, SameSite=Lax session token
    const sessionToken = createSessionToken({
      subscriberId: account.id,
      accountId: account.id,
      email: account.email,
      isVerified: true,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful.',
        subscriber: {
          id: account.id,
          email: account.email,
          is_verified: 1,
        },
        account: {
          id: account.id,
          email: account.email,
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
