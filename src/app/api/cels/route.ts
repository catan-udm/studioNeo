import { NextRequest, NextResponse } from 'next/server';
import { queryRows } from '@/lib/db';
import { CelRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const artistHandle = url.searchParams.get('artist')?.trim().toLowerCase();
    const category = url.searchParams.get('category')?.trim();
    const code = url.searchParams.get('code')?.trim().toUpperCase();

    let sql = 'SELECT * FROM cels WHERE 1=1';
    const params: unknown[] = [];

    if (artistHandle) {
      sql += ' AND LOWER(artist_handle) = ?';
      params.push(artistHandle);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (code) {
      sql += ' AND UPPER(code) = ?';
      params.push(code);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await queryRows<CelRecord>(sql, params);

    return NextResponse.json({
      success: true,
      count: rows.length,
      cels: rows,
    });
  } catch (error: unknown) {
    console.error('[API /api/cels] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve archive cels' },
      { status: 500 }
    );
  }
}
