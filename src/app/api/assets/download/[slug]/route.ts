import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow } from '@/lib/db';
import { generatePerkSasUrl } from '@/lib/azure-storage';

interface PerkDownloadRecord {
  id: number;
  slug: string;
  title: string;
  storage_file_path: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Authenticate the subscriber's session cookie
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be authenticated to download this asset.' },
        { status: 401 }
      );
    }

    // 2. Resolve dynamic route params (Next.js 15/16 async params)
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Asset slug is required.' },
        { status: 400 }
      );
    }

    // 3. Query perk_unlocks joined with perks to verify subscriber authorization
    const perk = await queryRow<PerkDownloadRecord>(
      `SELECT p.id, p.slug, p.title, p.storage_file_path
       FROM perks p
       INNER JOIN perk_unlocks pu ON pu.perk_id = p.id
       WHERE pu.subscriber_id = ? AND p.slug = ?
       LIMIT 1`,
      [session.subscriberId, slug]
    );

    if (!perk) {
      return NextResponse.json(
        {
          error:
            'Access denied. This digital perk has not been unlocked for your subscriber account.',
          slug,
        },
        { status: 403 }
      );
    }

    // 4. Generate read-only 15-minute expiring Azure Blob Storage SAS URL
    const expiresInMinutes = 15;
    const filename = perk.storage_file_path.split('/').pop() || `${slug}.dat`;
    const contentDisposition = `attachment; filename="${filename}"`;

    const sasUrl = await generatePerkSasUrl(perk.storage_file_path, {
      expiresInMinutes,
      contentDisposition,
    });

    // 5. Check if client expects JSON or direct redirect
    const url = new URL(request.url);
    const wantsJson =
      url.searchParams.get('format') === 'json' ||
      request.headers.get('accept')?.includes('application/json');

    if (wantsJson) {
      return NextResponse.json(
        {
          success: true,
          perk: {
            id: perk.id,
            slug: perk.slug,
            title: perk.title,
          },
          downloadUrl: sasUrl,
          expiresInMinutes,
        },
        { status: 200 }
      );
    }

    // Return 302 Redirect directly to the Azure Blob SAS URL
    return NextResponse.redirect(sasUrl, 302);
  } catch (error: unknown) {
    console.error('[API /api/assets/download/[slug]] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while preparing asset download.' },
      { status: 500 }
    );
  }
}
