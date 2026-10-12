import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, CelRecord } from '@/lib/db';
import { generatePerkSasUrl, generateCelSasUrl, getBlobData } from '@/lib/azure-storage';
import { ALL_GALLERY_WORKS, generateStandaloneSvg } from '@/app/gallery/galleryData';

interface PerkDownloadRecord {
  id: number;
  slug: string;
  title: string;
  storage_file_path: string;
}

interface SubscriberTierRecord {
  id: number;
  tier: string;
}

function isVaultSubscriberTier(tier?: string): boolean {
  if (!tier) return false;
  const t = tier.toLowerCase();
  return (
    t === 'studio-alpha' ||
    t === 'studio-atelier' ||
    t === 'enterprise' ||
    t === 'collector' ||
    t === 'studio' ||
    t.startsWith('artist') ||
    t.startsWith('illustrator') ||
    t === 'admin' ||
    t === 'curator'
  );
}

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

    // 3. Also check database for minted cels
    const dbCel = !matchedWork
      ? await queryRow<CelRecord>(
          'SELECT * FROM cels WHERE LOWER(code) = ? OR id = ? LIMIT 1',
          [cleanSlug, isNaN(Number(cleanSlug)) ? -1 : Number(cleanSlug)]
        )
      : null;

    // A. Viewing & Standard Web Exports (PNG / JPG preview) are automatically free for all community visitors
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
        return new NextResponse(blobData.data, {
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

    // B. High-quality / original master assets (raw vector SVG master, 4K render, kinetic master GIF)
    // and Subscriber Vault cels require authentication and active membership tier
    const session = await getSessionUser();
    let isSubscriber = false;

    if (session && session.subscriberId) {
      const subRecord = await queryRow<SubscriberTierRecord>(
        'SELECT id, tier FROM subscribers WHERE id = ? LIMIT 1',
        [session.subscriberId]
      );
      isSubscriber = Boolean(subRecord && isVaultSubscriberTier(subRecord.tier));
    }

    // Handle Gallery Work master downloads
    if (matchedWork) {
      if ((matchedWork.isVault || requestedFormat === 'svg' || requestedFormat === 'gif' || requestedFormat === 'raw' || requestedFormat === '4k') && !isSubscriber) {
        return NextResponse.json(
          {
            error:
              'Access denied. High-quality master vector stems (SVG), 4K renders, and subscriber vault cels are reserved for active membership tier holders (studio-alpha, studio-atelier, enterprise).',
            slug: cleanSlug,
            requiresUpgrade: true,
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

    // Handle DB Cel master downloads
    if (dbCel) {
      if ((dbCel.is_vault === 1 || requestedFormat === 'svg' || requestedFormat === 'gif') && !isSubscriber) {
        return NextResponse.json(
          {
            error:
              'Access denied. High-quality master assets and subscriber vaults require an active membership tier.',
            slug: cleanSlug,
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }

      if (requestedFormat === 'gif' && dbCel.gif_storage_path) {
        const sasUrl = await generateCelSasUrl(dbCel.gif_storage_path, { expiresInMinutes: 15 });
        return NextResponse.redirect(sasUrl, 302);
      }

      if (dbCel.svg_storage_path) {
        const sasUrl = await generateCelSasUrl(dbCel.svg_storage_path, { expiresInMinutes: 15 });
        return NextResponse.redirect(sasUrl, 302);
      }
    }

    // C. Traditional perks downloads
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be authenticated to download this asset.' },
        { status: 401 }
      );
    }

    let perk = await queryRow<PerkDownloadRecord>(
      `SELECT p.id, p.slug, p.title, p.storage_file_path
       FROM perks p
       INNER JOIN perk_unlocks pu ON pu.perk_id = p.id
       WHERE pu.subscriber_id = ? AND p.slug = ?
       LIMIT 1`,
      [session.subscriberId, cleanSlug]
    );

    if (!perk && isSubscriber) {
      perk = await queryRow<PerkDownloadRecord>(
        'SELECT id, slug, title, storage_file_path FROM perks WHERE slug = ? LIMIT 1',
        [cleanSlug]
      );
    }

    if (!perk) {
      return NextResponse.json(
        {
          error:
            'Access denied. This digital perk has not been unlocked for your subscriber account.',
          slug: cleanSlug,
        },
        { status: 403 }
      );
    }

    const expiresInMinutes = 15;
    const filename = perk.storage_file_path.split('/').pop() || `${cleanSlug}.dat`;
    const contentDisposition = `attachment; filename="${filename}"`;

    const sasUrl = await generatePerkSasUrl(perk.storage_file_path, {
      expiresInMinutes,
      contentDisposition,
    });

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
          availableFormats: ['zip', 'pdf', 'tar.gz', 'json'],
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(sasUrl, 302);
  } catch (error: unknown) {
    console.error('[API /api/assets/download/[slug]] Error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while preparing asset download.' },
      { status: 500 }
    );
  }
}
