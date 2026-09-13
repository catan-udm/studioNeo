import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse, RegistrationResponseJSON } from '@simplewebauthn/server';
import { getSessionUser } from '@/lib/auth';
import { execute, queryRow } from '@/lib/db';
import { getRPConfig, getPasskeyChallenge, clearPasskeyChallenge } from '@/lib/webauthn';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be signed in to register a passkey.' },
        { status: 401 }
      );
    }

    const challengePayload = await getPasskeyChallenge('registration');
    if (!challengePayload) {
      return NextResponse.json(
        { error: 'Passkey registration challenge expired or missing. Please try again.' },
        { status: 400 }
      );
    }

    const body: RegistrationResponseJSON = await request.json();
    const { rpID, origin, expectedOrigins } = getRPConfig(request);

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengePayload.challenge,
      expectedOrigin: expectedOrigins || origin,
      expectedRPID: rpID,
      requireUserVerification: false, // Allows both PIN/Biometrics and simple user presence
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Failed to verify passkey registration response.' },
        { status: 400 }
      );
    }

    const { credential } = verification.registrationInfo;
    const credentialId = credential.id;
    const publicKeyBase64 = Buffer.from(credential.publicKey).toString('base64url');
    const counter = credential.counter;
    const transports = JSON.stringify(body.response.transports || credential.transports || []);

    // Strict Check: Ensure this passkey is not already registered to a different subscriber
    const existingCred = await queryRow<{ id: number; subscriber_id: number }>(
      'SELECT id, subscriber_id FROM webauthn_credentials WHERE credential_id = ? LIMIT 1',
      [credentialId]
    );

    if (existingCred && Number(existingCred.subscriber_id) !== Number(session.subscriberId)) {
      return NextResponse.json(
        { error: 'This passkey hardware token is already registered to another account.' },
        { status: 409 }
      );
    }

    // Insert or update credential for current subscriber
    await execute(
      `INSERT INTO webauthn_credentials (subscriber_id, credential_id, public_key, counter, transports)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE public_key = VALUES(public_key), counter = VALUES(counter), transports = VALUES(transports)`,
      [session.subscriberId, credentialId, publicKeyBase64, counter, transports]
    );

    await clearPasskeyChallenge();

    return NextResponse.json(
      {
        success: true,
        message: 'Passkey successfully registered to your subscriber account.',
        credentialId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/passkey/register-verify] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Passkey verification error: ${detail}` },
      { status: 500 }
    );
  }
}
