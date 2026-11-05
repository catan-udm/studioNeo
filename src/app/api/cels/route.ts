import { NextRequest, NextResponse } from 'next/server';
import { queryRows, CelRecord } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const artistHandle = url.searchParams.get('artist')?.trim().toLowerCase();
    const category = url.searchParams.get('category')?.trim();
    const code = url.searchParams.get('code')?.trim().toUpperCase();

    let sql = `
      SELECT
        a.id,
        a.account_id,
        a.code,
        a.title,
        a.description,
        ac.display_name AS artist,
        ac.handle AS artist_handle,
        COALESCE(ac.avatar_url, UPPER(LEFT(ac.display_name, 2))) AS artist_avatar,
        ac.artist_distinction,
        a.category,
        a.edition,
        a.color,
        a.price,
        a.likes_count AS likes,
        a.likes_count,
        CASE WHEN gif.id IS NOT NULL THEN '4K' ELSE 'SVG' END AS format,
        COALESCE(svg.storage_path, '') AS svg_storage_path,
        svg.url AS svg_url,
        gif.storage_path AS gif_storage_path,
        gif.url AS gif_url,
        a.is_vault,
        a.created_at,
        a.updated_at
      FROM artworks a
      INNER JOIN accounts ac ON ac.id = a.account_id
      LEFT JOIN artwork_assets svg ON svg.artwork_id = a.id AND svg.asset_type = 'master_svg'
      LEFT JOIN artwork_assets gif ON gif.artwork_id = a.id AND gif.asset_type = 'preview_gif'
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (artistHandle) {
      sql += ' AND LOWER(ac.handle) = ?';
      params.push(artistHandle);
    }

    if (category && category !== 'All') {
      sql += ' AND a.category = ?';
      params.push(category);
    }

    if (code) {
      sql += ' AND UPPER(a.code) = ?';
      params.push(code);
    }

    sql += ' ORDER BY a.created_at DESC';

    const rows = await queryRows<CelRecord>(sql, params);

    return NextResponse.json({
      success: true,
      count: rows.length,
      cels: rows,
    });
  } catch (error: unknown) {
    console.error('[API /api/cels] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve archive artworks' },
      { status: 500 }
    );
  }
}
