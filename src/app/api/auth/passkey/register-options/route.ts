import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getSessionUser } from '@/lib/auth';
import { queryRows } from '@/lib/db';
import { getRPConfig, setPasskeyChallenge } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to register a passkey.' },
        { status: 401 }
      );
    }

    const { rpID, rpName } = getRPConfig(request);

    // 1. Fetch existing passkey credentials to exclude duplicates
    let existingCredentials: Array<{ credential_id: string; transports?: string }> = [];
    try {
      existingCredentials = await queryRows<{ credential_id: string; transports?: string }>(
        'SELECT credential_id, transports FROM webauthn_credentials WHERE subscriber_id = ?',
        [session.subscriberId]
      );
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json(
          {
            error:
              'Database table `webauthn_credentials` does not exist yet. Please execute scripts/migrate_passkeys_and_oauth.sql.',
          },
          { status: 500 }
        );
      }
      throw err;
    }

    const excludeCredentials = existingCredentials.map((cred) => ({
      id: cred.credential_id,
      transports: cred.transports ? JSON.parse(cred.transports) : undefined,
    }));

    // 2. Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userName: session.email,
      userID: new Uint8Array(Buffer.from(String(session.subscriberId))),
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // 3. Store challenge in secure signed cookie
    await setPasskeyChallenge({
      challenge: options.challenge,
      subscriberId: Number(session.subscriberId),
      type: 'registration',
    });

    return NextResponse.json(options, { status: 200 });
  } catch (error: unknown) {
    console.error('[API /api/auth/passkey/register-options] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to generate passkey registration options: ${detail}` },
      { status: 500 }
    );
  }
}
