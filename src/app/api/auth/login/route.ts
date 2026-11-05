import { NextRequest, NextResponse } from 'next/server';
import { queryRow } from '@/lib/db';
import { issueAndDispatchOTP, OTP_TTL_MINUTES } from '@/lib/auth';

interface LoginRequestBody {
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();

    // 1. Validate account existence
    const account = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM accounts WHERE email = ? LIMIT 1',
      [email]
    );

    if (!account) {
      return NextResponse.json(
        {
          error: 'No account found with this email address. Please register first.',
          code: 'ACCOUNT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (account.is_verified !== 1) {
      return NextResponse.json(
        {
          error: 'This account registration is pending verification. Please complete registration first.',
          code: 'ACCOUNT_UNVERIFIED',
          email,
        },
        { status: 403 }
      );
    }

    // 2. Issue and dispatch 6-digit OTP
    const { otp, dispatch: dispatchResult } = await issueAndDispatchOTP(account.id, email);

    return NextResponse.json(
      {
        success: true,
        message: 'A 6-digit login verification code has been dispatched to your email inbox.',
        email,
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
    console.error('[API /api/auth/login] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: string })?.code;
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'production'
            ? 'An internal server error occurred while processing login.'
            : `Database/Login Error [${code || 'UNKNOWN'}]: ${detail}`,
      },
      { status: 500 }
    );
  }
}
