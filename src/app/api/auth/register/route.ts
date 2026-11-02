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
    const existingSubscriber = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
      [email]
    );

    // If account already exists and is fully verified, reject registration
    if (existingSubscriber && existingSubscriber.is_verified === 1) {
      return NextResponse.json(
        {
          error: 'An account with this email address already exists. Please sign in instead.',
          code: 'ACCOUNT_ALREADY_EXISTS',
          email,
        },
        { status: 409 }
      );
    }

    let subscriberId: number;
    const isResendForPending = Boolean(existingSubscriber && existingSubscriber.is_verified === 0);

    if (!existingSubscriber) {
      // Create new subscriber record with is_verified = 0 (pending email OTP verification)
      const insertResult = await execute(
        'INSERT INTO subscribers (email, is_verified) VALUES (?, 0)',
        [email]
      );
      subscriberId = insertResult.insertId;
    } else {
      // Resend code to complete pending verification
      subscriberId = existingSubscriber.id;
    }

    // 2. Issue and dispatch 6-digit OTP
    const { otp, dispatch: dispatchResult } = await issueAndDispatchOTP(subscriberId, email);

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
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
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
