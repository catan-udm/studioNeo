import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { execute } from '@/lib/db';
import {
  generateBase32Secret,
  formatSecretForDisplay,
  generateOtpauthUri,
  generateQrCodeDataUrl,
  generateQrCodeSvg,
} from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to configure two-factor authentication.' },
        { status: 401 }
      );
    }

    // 1. Generate a fresh Base32 secret (20 random bytes = 160 bits)
    const secret = generateBase32Secret();
    const formattedSecret = formatSecretForDisplay(secret);

    // 2. Build standard RFC 6238 Key URI (compatible with Google Authenticator, Apple Passwords, etc.)
    const otpauthUri = generateOtpauthUri(secret, session.email, 'bikko.studio');

    // 3. Generate high-contrast standalone SVG QR code and data URL
    const qrCodeSvg = generateQrCodeSvg(otpauthUri, { size: 220 });
    const qrCodeDataUrl = generateQrCodeDataUrl(otpauthUri);

    // 4. Save pending secret in database with is_active = 0 until verified
    await execute(
      `INSERT INTO totp_credentials (subscriber_id, totp_secret, is_active)
       VALUES (?, ?, 0)
       ON DUPLICATE KEY UPDATE totp_secret = VALUES(totp_secret), is_active = 0`,
      [session.subscriberId, secret]
    );

    return NextResponse.json(
      {
        success: true,
        secret,
        formattedSecret,
        otpauthUri,
        qrCodeSvg,
        qrCodeDataUrl,
        message: 'Scan the QR code with your authenticator app, or enter the key manually.',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/totp/setup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize TOTP two-factor setup ceremony.' },
      { status: 500 }
    );
  }
}
