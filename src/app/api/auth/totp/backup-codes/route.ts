import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow } from '@/lib/db';
import { regenerateAndStoreBackupCodes } from '@/lib/totp';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to regenerate backup codes.' },
        { status: 401 }
      );
    }

    const totpRecord = await queryRow<{ is_active: number }>(
      'SELECT is_active FROM totp_credentials WHERE subscriber_id = ? AND is_active = 1 LIMIT 1',
      [session.subscriberId]
    );

    if (!totpRecord || totpRecord.is_active !== 1) {
      return NextResponse.json(
        { error: 'Two-factor authentication must be enabled to generate backup recovery codes.' },
        { status: 400 }
      );
    }

    const codes = await regenerateAndStoreBackupCodes(session.subscriberId, false);

    return NextResponse.json(
      {
        success: true,
        message: 'Fresh emergency backup recovery codes generated successfully.',
        backupCodes: codes,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    console.error('[API /api/auth/totp/backup-codes] Error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes.' },
      { status: 500 }
    );
  }
}
