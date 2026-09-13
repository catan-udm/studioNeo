import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse, AuthenticationResponseJSON } from '@simplewebauthn/server';
import { queryRow, execute } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { getRPConfig, getPasskeyChallenge, clearPasskeyChallenge } from '@/lib/webauthn';

interface CredentialRow {
  id: number;
  subscriber_id: number;
  credential_id: string;
  public_key: string;
  counter: string | number;
  email: string;
  is_verified: number;
}

export async function POST(request: NextRequest) {
  try {
    const challengePayload = await getPasskeyChallenge('authentication');
    if (!challengePayload) {
      return NextResponse.json(
        { error: 'Passkey login challenge expired or invalid. Please try again.' },
        { status: 400 }
      );
    }

    const body: AuthenticationResponseJSON = await request.json();
    const credentialId = body.id;

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Missing credential ID in authentication response.' },
        { status: 400 }
      );
    }

    // Lookup matching credential in database
    const credRecord = await queryRow<CredentialRow>(
      `SELECT w.id, w.subscriber_id, w.credential_id, w.public_key, w.counter, s.email, s.is_verified
       FROM webauthn_credentials w
       INNER JOIN subscribers s ON s.id = w.subscriber_id
       WHERE w.credential_id = ?
       LIMIT 1`,
      [credentialId]
    );

    if (!credRecord) {
      return NextResponse.json(
        {
          error:
            'Passkey not recognized. Please sign in with Email OTP first and register this passkey from your dashboard.',
        },
        { status: 401 }
      );
    }

    if (credRecord.is_verified !== 1) {
      return NextResponse.json(
        { error: 'The account associated with this passkey has not completed verification.' },
        { status: 403 }
      );
    }

    if (
      challengePayload.subscriberId &&
      Number(challengePayload.subscriberId) !== Number(credRecord.subscriber_id)
    ) {
      return NextResponse.json(
        { error: 'The provided passkey does not match the requested subscriber account.' },
        { status: 403 }
      );
    }

    const { rpID, expectedOrigins } = getRPConfig(request);

    // Convert stored base64url public key to Uint8Array
    const publicKeyBytes = new Uint8Array(Buffer.from(credRecord.public_key, 'base64url'));

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      credential: {
        id: credRecord.credential_id,
        publicKey: publicKeyBytes,
        counter: Number(credRecord.counter),
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Passkey cryptographic signature verification failed.' },
        { status: 401 }
      );
    }

    // Update credential counter to prevent replay attacks
    const newCounter = verification.authenticationInfo.newCounter;
    await execute('UPDATE webauthn_credentials SET counter = ? WHERE id = ?', [
      newCounter,
      credRecord.id,
    ]);

    // Ensure subscriber is marked verified
    await execute('UPDATE subscribers SET is_verified = 1 WHERE id = ?', [
      credRecord.subscriber_id,
    ]);

    // Issue unified session cookie
    const token = createSessionToken({
      subscriberId: credRecord.subscriber_id,
      email: credRecord.email,
      isVerified: true,
    });

    await setSessionCookie(token);
    await clearPasskeyChallenge();

    return NextResponse.json(
      {
        success: true,
        message: 'Passkey authentication successful.',
        subscriber: {
          id: credRecord.subscriber_id,
          email: credRecord.email,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/passkey/login-verify] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Passkey authentication error: ${detail}` },
      { status: 500 }
    );
  }
}
