import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, execute, CelRecord, AccountRecord } from '@/lib/db';
import { generateCelSasUrl, getBlobData } from '@/lib/azure-storage';
import {
  ALL_GALLERY_WORKS,
  generateStandaloneSvg,
  isVaultSubscriberTier,
} from '@/app/gallery/galleryData';
import { isPartnerHandle } from '@/data/artistRoles';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Resolve dynamic route params
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ error: 'Asset slug is required.' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase();
    const url = new URL(request.url);
    const requestedFormat = (url.searchParams.get('format') || '').toLowerCase();
    const wantsJson =
      requestedFormat === 'json' || request.headers.get('accept')?.includes('application/json');

    // 2. Check if the slug corresponds to a Gallery Artwork (e.g. neo-01, axis-04, etc.)
    const matchedWork = ALL_GALLERY_WORKS.find(
      (w) => w.code.toLowerCase() === cleanSlug || w.id.toLowerCase() === cleanSlug
    );

    // 3. Check BCNF database for minted artworks joined with accounts and assets
    const dbCel = !matchedWork
      ? await queryRow<CelRecord>(
          `SELECT
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
           WHERE LOWER(a.code) = ? OR a.id = ?
           LIMIT 1`,
          [cleanSlug, isNaN(Number(cleanSlug)) ? -1 : Number(cleanSlug)]
        )
      : null;

    // A. Viewing & Standard Web Exports (PNG / JPG preview) are free for all community visitors
    const isFreeWebExport =
      requestedFormat === 'png' ||
      requestedFormat === 'jpg' ||
      url.searchParams.get('preview') === 'true';

    if (matchedWork && isFreeWebExport) {
      const svgData = generateStandaloneSvg(matchedWork);
      if (wantsJson) {
        return NextResponse.json({
          success: true,
          type: 'preview',
          work: {
            id: matchedWork.id,
            code: matchedWork.code,
            title: matchedWork.title,
            artist: matchedWork.artist,
            category: matchedWork.category,
            edition: matchedWork.edition,
          },
          previewFormat: requestedFormat || 'svg',
          freeAccess: true,
        });
      }

      return new NextResponse(svgData, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `inline; filename="studioNeo-${matchedWork.code}-preview.svg"`,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    if (dbCel && isFreeWebExport) {
      if (wantsJson) {
        return NextResponse.json({
          success: true,
          type: 'preview',
          cel: {
            id: dbCel.id,
            code: dbCel.code,
            title: dbCel.title,
            artist: dbCel.artist,
            category: dbCel.category,
            edition: dbCel.edition,
          },
          previewFormat: requestedFormat || 'svg',
          freeAccess: true,
        });
      }

      const blobData = dbCel.svg_storage_path ? getBlobData(dbCel.svg_storage_path) : null;
      if (blobData) {
        return new NextResponse(new Uint8Array(blobData.data), {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Content-Disposition': `inline; filename="studioNeo-${dbCel.code}-preview.svg"`,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?><svg width="1200" height="1200" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="${dbCel.color}"/><circle cx="200" cy="200" r="100" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="2"/><text x="200" y="210" text-anchor="middle" font-family="sans-serif" font-size="14" fill="rgba(0,0,0,0.7)">${dbCel.code} • Preview</text></svg>`;
      return new NextResponse(fallbackSvg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `inline; filename="studioNeo-${dbCel.code}-preview.svg"`,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // B. High-quality / original master assets require Partner / Featured authorization
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    let isAuthorized = false;

    if (session && accountId) {
      const account = await queryRow<AccountRecord>(
        'SELECT id, system_role, artist_distinction FROM accounts WHERE id = ? LIMIT 1',
        [accountId]
      );
      isAuthorized = Boolean(
        account &&
          (account.artist_distinction === 'partner' ||
            account.artist_distinction === 'featured' ||
            account.system_role === 'curator' ||
            account.system_role === 'admin' ||
            (account.tier && isVaultSubscriberTier(account.tier)))
      );
    }

    // Handle Gallery Work master downloads
    if (matchedWork) {
      const workIsPartner = isPartnerHandle(matchedWork.artistHandle);
      if (
        (matchedWork.isVault ||
          requestedFormat === 'svg' ||
          requestedFormat === 'gif' ||
          requestedFormat === 'raw' ||
          requestedFormat === '4k') &&
        !isAuthorized &&
        !workIsPartner
      ) {
        return NextResponse.json(
          {
            error:
              "Artist Rights Reserved: studioNeo does not have the right to distribute illustrator works unless specified as an authorized 'Partner' or 'Featured' artist project.",
            slug: cleanSlug,
            requiresUpgrade: false,
          },
          { status: 403 }
        );
      }

      if (wantsJson) {
        return NextResponse.json({
          success: true,
          type: 'artwork',
          work: {
            id: matchedWork.id,
            code: matchedWork.code,
            title: matchedWork.title,
            artist: matchedWork.artist,
            category: matchedWork.category,
            edition: matchedWork.edition,
            color: matchedWork.color,
            format: matchedWork.format,
            isVault: Boolean(matchedWork.isVault),
            gifSrc: matchedWork.gifSrc,
          },
          availableFormats: ['svg', 'png', 'jpg', 'gif'],
        });
      }

      if (requestedFormat === 'gif') {
        if (matchedWork.gifSrc) {
          return NextResponse.redirect(matchedWork.gifSrc, 302);
        }
        return NextResponse.json(
          { error: 'Kinetic animated GIF is only available for kinetic motion works.' },
          { status: 400 }
        );
      }

      const svgData = generateStandaloneSvg(matchedWork);
      return new NextResponse(svgData, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="studioNeo-${matchedWork.code}-master.svg"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    }

    // Handle DB Artwork master downloads
    if (dbCel) {
      const isPartnerWork =
        dbCel.artist_distinction === 'partner' || isPartnerHandle(dbCel.artist_handle);

      if (
        (dbCel.is_vault === 1 || requestedFormat === 'svg' || requestedFormat === 'gif') &&
        !isAuthorized &&
        !isPartnerWork
      ) {
        return NextResponse.json(
          {
            error:
              "Artist Rights Reserved: studioNeo does not have the right to distribute illustrator works unless specified as an authorized 'Partner' or 'Featured' artist project.",
            slug: cleanSlug,
            requiresUpgrade: false,
          },
          { status: 403 }
        );
      }

      const targetPath =
        requestedFormat === 'gif' && dbCel.gif_storage_path
          ? dbCel.gif_storage_path
          : dbCel.svg_storage_path;

      const sasUrl = await generateCelSasUrl(targetPath, {
        expiresInMinutes: 15,
        contentDisposition: `attachment; filename="studioNeo-${dbCel.code}-master.${
          requestedFormat === 'gif' && dbCel.gif_storage_path ? 'gif' : 'svg'
        }"`,
      });

      // Record download audit in BCNF `artwork_downloads` table if user is logged in
      if (accountId) {
        try {
          await execute(
            'INSERT INTO artwork_downloads (account_id, artwork_id, asset_id, format, ip_address) VALUES (?, ?, ?, ?, ?)',
            [
              Number(accountId),
              dbCel.id,
              1,
              requestedFormat || 'svg',
              request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
            ]
          );
        } catch {
          // Audit logging is non-blocking
        }
      }

      if (wantsJson) {
        return NextResponse.json({
          success: true,
          type: 'cel',
          cel: dbCel,
          downloadUrl: sasUrl,
          expiresInMinutes: 15,
        });
      }

      return NextResponse.redirect(sasUrl, 302);
    }

    return NextResponse.json(
      {
        error: 'Artwork or authorized asset not found.',
        slug: cleanSlug,
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error('[API /api/assets/download/[slug]] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while preparing asset download.' },
      { status: 500 }
    );
  }
}
