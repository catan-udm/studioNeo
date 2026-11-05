import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute } from '@/lib/db';
import { issueAndDispatchOTP, OTP_TTL_MINUTES, EMAIL_REGEX } from '@/lib/auth';

interface RegisterRequestBody {
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // Standard RFC-compliant email regex
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email format.' },
        { status: 422 }
      );
    }

    // 1. Strict Existing Account Validation
    const existingAccount = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM accounts WHERE email = ? LIMIT 1',
      [email]
    );

    // If account already exists and is fully verified, reject registration
    if (existingAccount && existingAccount.is_verified === 1) {
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
          code: 'ACCOUNT_ALREADY_EXISTS',
          email,
        },
        { status: 409 }
      );
    }

    let accountId: number;
    const isResendForPending = Boolean(existingAccount && existingAccount.is_verified === 0);

    if (!existingAccount) {
      // Derive unique handle & display name for BCNF accounts table
      const baseHandle = (email.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const uniqueHandle = `${baseHandle}_${Math.floor(1000 + Math.random() * 9000)}`;
      const displayName = (email.split('@')[0] || 'Studio User').replace(/^\w/, (c) => c.toUpperCase());

      // Create new account record with is_verified = 0 (pending email OTP verification)
      const insertResult = await execute(
        'INSERT INTO accounts (email, handle, display_name, is_verified, system_role, artist_distinction) VALUES (?, ?, ?, ?, ?, ?)',
        [email, uniqueHandle, displayName, 0, 'user', 'none']
      );
      accountId = insertResult.insertId;
    } else {
      // Resend code to complete pending verification
      accountId = existingAccount.id;
    }

    // 2. Issue and dispatch 6-digit OTP
    const { otp, dispatch: dispatchResult } = await issueAndDispatchOTP(accountId, email);

    return NextResponse.json(
      {
        success: true,
        message: isResendForPending
          ? 'A verification code has been dispatched to complete your account registration.'
          : 'A 6-digit verification code has been dispatched to your email inbox.',
        email,
        isPendingVerification: isResendForPending,
        expiresInMinutes: OTP_TTL_MINUTES,
        dispatchChannel: dispatchResult.channel,
        devOtp:
          process.env.NODE_ENV !== 'production' || dispatchResult.channel === 'console'
            ? otp
            : undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/register] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: string })?.code;
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'production'
            ? 'An internal server error occurred while processing registration.'
            : `Database/Registration Error [${code || 'UNKNOWN'}]: ${detail}`,
      },
      { status: 500 }
    );
  }
}
