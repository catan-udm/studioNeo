import { NextRequest, NextResponse } from 'next/server';
import { queryRow, execute } from '@/lib/db';
import { generateOTP, hashToken, sendOTPEmail, OTP_TTL_MINUTES } from '@/lib/auth';

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
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email format.' },
        { status: 422 }
      );
    }

    // 1. Fetch or create subscriber record
    let subscriber = await queryRow<{ id: number; email: string; is_verified: number }>(
      'SELECT id, email, is_verified FROM subscribers WHERE email = ? LIMIT 1',
      [email]
    );

    let subscriberId: number;

    if (!subscriber) {
      // Create new subscriber record with is_verified = 0
      const insertResult = await execute(
        'INSERT INTO subscribers (email, is_verified) VALUES (?, 0)',
        [email]
      );
      subscriberId = insertResult.insertId;
    } else {
      subscriberId = subscriber.id;
    }

    // 2. Generate a cryptographically secure 6-digit numeric OTP
    const otp = generateOTP();
    const tokenHash = hashToken(otp);

    // 3. Compute 10-minute expiration in UTC
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // 4. Invalidate any prior unused tokens for this subscriber to avoid token sprawl
    await execute(
      'UPDATE auth_magic_tokens SET consumed_at = NOW() WHERE subscriber_id = ? AND consumed_at IS NULL',
      [subscriberId]
    );

    // 5. Insert token hash into auth_magic_tokens
    await execute(
      'INSERT INTO auth_magic_tokens (subscriber_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [subscriberId, tokenHash, expiresAt]
    );

    // 6. Transactional notification dispatch
    await sendOTPEmail(email, otp);

    return NextResponse.json(
      {
        success: true,
        message: 'A 6-digit verification code has been dispatched to your email address.',
        email,
        expiresInMinutes: OTP_TTL_MINUTES,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/register] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while processing registration.' },
      { status: 500 }
    );
  }
}
