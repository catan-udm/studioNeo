import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, execute } from '@/lib/db';
import { uploadBlob, generateCelSasUrl } from '@/lib/azure-storage';

export const dynamic = 'force-dynamic';

function isArtistTier(tier?: string): boolean {
  if (!tier) return false;
  const t = tier.toLowerCase();
  return (
    t.startsWith('artist') ||
    t.startsWith('illustrator') ||
    t === 'admin' ||
    t === 'curator'
  );
}

function sanitizeHandle(handle: string): string {
  return handle.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 32);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Session authentication
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or register to access the Creator Studio.' },
        { status: 401 }
      );
    }

    // 2. Verification of artist tier
    const subscriber = await queryRow<{ id: number; email: string; tier: string }>(
      'SELECT id, email, tier FROM subscribers WHERE id = ? LIMIT 1',
      [session.subscriberId]
    );

    if (!subscriber || !isArtistTier(subscriber.tier)) {
      return NextResponse.json(
        {
          error:
            'Access Reserved: Creator Studio is exclusively available to verified artists and illustrators. Apply via our Curatorial Desk',
          curatorDeskUrl: '/contact?topic=artist_application',
        },
        { status: 403 }
      );
    }

    // 3. Parse FormData
    const formData = await request.formData();
    const title = (formData.get('title') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const category = (formData.get('category') as string || 'Generative').trim() as
      | 'Generative'
      | 'Kinetic'
      | 'Vectors'
      | 'Mono';
    const edition = (formData.get('edition') as string || 'Ed. 1/12').trim();
    const color = (formData.get('color') as string || '#c496ff').trim();
    const price = (formData.get('price') as string || '$180').trim();
    const isVault = formData.get('isVault') === 'true' || formData.get('isVault') === '1';

    let artistName = (formData.get('artist') as string || '').trim();
    let artistHandle = (formData.get('artistHandle') as string || '').trim();

    if (!artistName) {
      artistName = subscriber.email.split('@')[0];
      artistName = artistName.charAt(0).toUpperCase() + artistName.slice(1);
    }

    if (!artistHandle) {
      artistHandle = sanitizeHandle(subscriber.email.split('@')[0]);
    } else {
      artistHandle = sanitizeHandle(artistHandle);
    }

    const artistAvatar = artistName.slice(0, 2).toUpperCase();

    if (!title || title.length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid cel title (minimum 2 characters).' },
        { status: 422 }
      );
    }

    // 4. Validate SVG Master File
    const svgFile = formData.get('svgFile') as File | null;
    if (!svgFile || typeof svgFile.arrayBuffer !== 'function') {
      return NextResponse.json(
        { error: 'A prepared .svg vector master file is required for studio minting.' },
        { status: 422 }
      );
    }

    const svgFilename = svgFile.name || 'master.svg';
    if (!svgFilename.toLowerCase().endsWith('.svg') && svgFile.type !== 'image/svg+xml') {
      return NextResponse.json(
        { error: 'Invalid file format. Vector master file must be an .svg file.' },
        { status: 422 }
      );
    }

    const svgBuffer = Buffer.from(await svgFile.arrayBuffer());
    const svgContentString = svgBuffer.toString('utf8');
    if (!svgContentString.includes('<svg') || !svgContentString.includes('</svg>')) {
      return NextResponse.json(
        { error: 'Malformed SVG content. The file must contain valid <svg> XML root markup.' },
        { status: 422 }
      );
    }

    // Sanitize SVG content against script injection / XSS
    const sanitizedSvg = svgContentString
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
      .replace(/\s+on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, '');
    const cleanSvgBuffer = Buffer.from(sanitizedSvg, 'utf8');

    // 5. Optional GIF Kinetic Master File
    const gifFile = formData.get('gifFile') as File | null;
    let gifBuffer: Buffer | null = null;
    if (gifFile && typeof gifFile.arrayBuffer === 'function' && gifFile.size > 0) {
      const gifFilename = gifFile.name || 'kinetic.gif';
      if (!gifFilename.toLowerCase().endsWith('.gif') && gifFile.type !== 'image/gif') {
        return NextResponse.json(
          { error: 'Kinetic motion master must be an animated .gif file.' },
          { status: 422 }
        );
      }
      gifBuffer = Buffer.from(await gifFile.arrayBuffer());
    }

    // 6. Generate Unique Cel Code
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const celCode = `CEL-${randomHex}`;

    // 7. Azure Blob Storage Persistence
    const svgStoragePath = `cels/${subscriber.id}/${celCode.toLowerCase()}-master.svg`;
    const svgUploadResult = await uploadBlob(
      svgStoragePath,
      cleanSvgBuffer,
      'image/svg+xml; charset=utf-8'
    );

    let gifStoragePath: string | null = null;
    let gifUploadResult: { url: string; storageFilePath: string } | null = null;
    if (gifBuffer) {
      gifStoragePath = `cels/${subscriber.id}/${celCode.toLowerCase()}-kinetic.gif`;
      gifUploadResult = await uploadBlob(gifStoragePath, gifBuffer, 'image/gif');
    }

    // 8. Generate SAS tokens for secure access
    const svgSasUrl = await generateCelSasUrl(svgStoragePath, { expiresInMinutes: 60 });
    const gifSasUrl = gifStoragePath
      ? await generateCelSasUrl(gifStoragePath, { expiresInMinutes: 60 })
      : null;

    // 9. Persist Cel Metadata in MySQL
    const insertResult = await execute(
      `INSERT INTO cels (
        subscriber_id, code, title, description, artist, artist_handle, artist_avatar,
        category, edition, color, price, likes, format, svg_storage_path, svg_url,
        gif_storage_path, gif_url, is_vault
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriber.id,
        celCode,
        title,
        description || null,
        artistName,
        artistHandle,
        artistAvatar,
        category,
        edition,
        color,
        price,
        0,
        category === 'Kinetic' && gifBuffer ? '4K' : 'SVG',
        svgStoragePath,
        svgUploadResult.url,
        gifStoragePath,
        gifUploadResult ? gifUploadResult.url : null,
        isVault ? 1 : 0,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Cel #${celCode} (${title}) successfully minted to studioNeo Digital Archive.`,
        cel: {
          id: insertResult.insertId,
          code: celCode,
          title,
          description,
          artist: artistName,
          artistHandle,
          artistAvatar,
          category,
          edition,
          color,
          price,
          likes: 0,
          format: category === 'Kinetic' && gifBuffer ? '4K' : 'SVG',
          svgUrl: svgUploadResult.url,
          svgSasUrl,
          gifUrl: gifUploadResult ? gifUploadResult.url : null,
          gifSasUrl,
          isVault,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[API /api/studio/upload] Error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Internal server error during cel upload & minting: ${detail}` },
      { status: 500 }
    );
  }
}
