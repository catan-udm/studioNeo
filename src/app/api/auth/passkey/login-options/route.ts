import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { queryRow, queryRows } from '@/lib/db';
import { getRPConfig, setPasskeyChallenge } from '@/lib/webauthn';

interface LoginOptionsBody {
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    let email: string | undefined;
    try {
      const body: LoginOptionsBody = await request.json();
      email = body.email?.trim().toLowerCase();
    } catch {
      // Body is optional for discoverable passkey login
    }

    const { rpID } = getRPConfig(request);

    type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';
    let allowCredentials: Array<{ id: string; transports?: AuthenticatorTransport[] }> | undefined = undefined;
    let subscriberId: number | undefined = undefined;

    if (email) {
      const subscriber = await queryRow<{ id: number; is_verified: number }>(
        'SELECT id, is_verified FROM subscribers WHERE email = ? LIMIT 1',
        [email]
      );

      if (!subscriber) {
        return NextResponse.json(
          { error: 'No account found with this email address. Please register first.' },
          { status: 404 }
        );
      }

      if (subscriber.is_verified !== 1) {
        return NextResponse.json(
          { error: 'This account has not completed registration verification. Please complete registration first.' },
          { status: 403 }
        );
      }

      subscriberId = subscriber.id;
      const creds = await queryRows<{ credential_id: string; transports?: string }>(
        'SELECT credential_id, transports FROM webauthn_credentials WHERE subscriber_id = ?',
        [subscriber.id]
      );

      if (creds.length === 0) {
        return NextResponse.json(
          {
            error:
              'No passkeys are registered for this account. Please sign in with email verification code or social login.',
          },
          { status: 400 }
        );
      }

      allowCredentials = creds.map((c) => ({
        id: c.credential_id,
        transports: c.transports ? JSON.parse(c.transports) : undefined,
      }));
    }

    // Generate authentication options (works for discoverable passkeys if allowCredentials is empty/undefined)
    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: 'preferred',
    });

    await setPasskeyChallenge({
      challenge: options.challenge,
      subscriberId,
      type: 'authentication',
    });

    return NextResponse.json(options, { status: 200 });
  } catch (error: unknown) {
    console.error('[API /api/auth/passkey/login-options] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to generate passkey authentication options: ${detail}` },
      { status: 500 }
    );
  }
}
