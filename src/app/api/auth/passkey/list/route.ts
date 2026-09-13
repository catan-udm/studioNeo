import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRows, execute } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const passkeys = await queryRows<{
        id: number;
        credential_id: string;
        counter: number;
        transports: string | null;
        created_at: string;
      }>(
        'SELECT id, credential_id, counter, transports, created_at FROM webauthn_credentials WHERE subscriber_id = ? ORDER BY id DESC',
        [session.subscriberId]
      );

      return NextResponse.json({ passkeys });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json({ passkeys: [], migrationRequired: true });
      }
      throw err;
    }
  } catch (error) {
    console.error('[API /api/auth/passkey/list] Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve passkeys' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { credentialId } = await request.json();
    if (!credentialId) {
      return NextResponse.json({ error: 'Missing credentialId' }, { status: 400 });
    }

    await execute(
      'DELETE FROM webauthn_credentials WHERE subscriber_id = ? AND credential_id = ?',
      [session.subscriberId, credentialId]
    );

    return NextResponse.json({ success: true, message: 'Passkey removed.' });
  } catch (error) {
    console.error('[API /api/auth/passkey/list DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to remove passkey' }, { status: 500 });
  }
}
