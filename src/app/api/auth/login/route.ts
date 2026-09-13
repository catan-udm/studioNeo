import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute } from '@/lib/db';
import { generateOTP, hashToken, sendOTPEmail, OTP_TTL_MINUTES } from '@/lib/auth';

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

    // 1. Validate subscriber existence
    const subscriber = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
      [email]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber account not found. Please register first.' },
        { status: 404 }
      );
    }

    // 2. Generate a cryptographically secure 6-digit numeric OTP
    const otp = generateOTP();
    const tokenHash = hashToken(otp);

    // 3. Compute 10-minute expiration timestamp in UTC
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // 4. Invalidate previous unconsumed tokens for this subscriber
    await execute(
      'UPDATE auth_magic_tokens SET consumed_at = NOW() WHERE subscriber_id = ? AND consumed_at IS NULL',
      [subscriber.id]
    );

    // 5. Store new OTP hash
    await execute(
      'INSERT INTO auth_magic_tokens (subscriber_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [subscriber.id, tokenHash, expiresAt]
    );

    // 6. Dispatch OTP to subscriber
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message: 'A 6-digit login verification code has been dispatched to your email.',
        email,
        expiresInMinutes: OTP_TTL_MINUTES,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/login] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing login.' },
      { status: 500 }
    );
  }
}
