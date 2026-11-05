import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { queryRow, execute, AccountRecord } from '@/lib/db';
import { uploadBlob, generateCelSasUrl } from '@/lib/azure-storage';
import { isArtistTier, sanitizeHandle, sanitizeSvgContent } from '@/app/gallery/galleryData';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Session authentication
    const session = await getSessionUser();
    const accountId = session?.accountId ?? session?.subscriberId;
    if (!session || !accountId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in or register to access the Creator Studio.' },
        { status: 401 }
      );
    }

    // 2. Verification of artist distinction or curatorial role on BCNF accounts table
    const account = await queryRow<AccountRecord>(
      'SELECT id, email, handle, display_name, system_role, artist_distinction FROM accounts WHERE id = ? LIMIT 1',
      [accountId]
    );

    const hasArtistAccess = Boolean(
      account &&
        (account.artist_distinction !== 'none' ||
          account.system_role === 'curator' ||
          account.system_role === 'admin' ||
          (account.tier && isArtistTier(account.tier)))
    );

    if (!account || !hasArtistAccess) {
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
    const title = ((formData.get('title') as string) || '').trim();
    const description = ((formData.get('description') as string) || '').trim();
    const category = ((formData.get('category') as string) || 'Generative').trim() as
      | 'Generative'
      | 'Kinetic'
      | 'Vectors'
      | 'Mono';
    const edition = ((formData.get('edition') as string) || 'Ed. 1/12').trim();
    const color = ((formData.get('color') as string) || '#c496ff').trim();
    const price = ((formData.get('price') as string) || '$180').trim();
    const isVault = formData.get('isVault') === 'true' || formData.get('isVault') === '1';

    let artistName = ((formData.get('artist') as string) || account.display_name || '').trim();
    let artistHandle = ((formData.get('artistHandle') as string) || account.handle || '').trim();

    if (!artistName) {
      artistName = account.email.split('@')[0];
      artistName = artistName.charAt(0).toUpperCase() + artistName.slice(1);
    }

    if (!artistHandle) {
      artistHandle = sanitizeHandle(account.email.split('@')[0]);
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
    const sanitizedSvg = sanitizeSvgContent(svgContentString);
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

    // 6. Generate Unique Artwork Code
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const celCode = `CEL-${randomHex}`;

    // 7. Azure Blob Storage Persistence
    const svgStoragePath = `cels/${account.id}/${celCode.toLowerCase()}-master.svg`;
    const svgUploadResult = await uploadBlob(
      svgStoragePath,
      cleanSvgBuffer,
      'image/svg+xml; charset=utf-8'
    );

    let gifStoragePath: string | null = null;
    let gifUploadResult: { url: string; storageFilePath: string } | null = null;
    if (gifBuffer) {
      gifStoragePath = `cels/${account.id}/${celCode.toLowerCase()}-kinetic.gif`;
      gifUploadResult = await uploadBlob(gifStoragePath, gifBuffer, 'image/gif');
    }

    // 8. Generate SAS tokens for secure access
    const svgSasUrl = await generateCelSasUrl(svgStoragePath, { expiresInMinutes: 60 });
    const gifSasUrl = gifStoragePath
      ? await generateCelSasUrl(gifStoragePath, { expiresInMinutes: 60 })
      : null;

    // 9. Update Artist Profile on BCNF `accounts` table if customized
    if (artistName !== account.display_name || artistHandle !== account.handle) {
      await execute(
        'UPDATE accounts SET display_name = ?, handle = ? WHERE id = ?',
        [artistName, artistHandle, account.id]
      );
    }

    // 10. Persist Normalized Artwork in `artworks` (Zero redundant artist fields)
    const insertArtworkResult = await execute(
      `INSERT INTO artworks (
        account_id, code, title, description, category, edition, color, price, is_vault
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        celCode,
        title,
        description || null,
        category,
        edition,
        color,
        price,
        isVault ? 1 : 0,
      ]
    );
    const artworkId = insertArtworkResult.insertId;

    // 11. Persist Normalized 1:N Media Assets in `artwork_assets`
    await execute(
      `INSERT INTO artwork_assets (
        artwork_id, asset_type, storage_path, url, mime_type, file_size_bytes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        artworkId,
        'master_svg',
        svgStoragePath,
        svgUploadResult.url,
        'image/svg+xml',
        cleanSvgBuffer.byteLength,
      ]
    );

    if (gifStoragePath && gifUploadResult && gifBuffer) {
      await execute(
        `INSERT INTO artwork_assets (
          artwork_id, asset_type, storage_path, url, mime_type, file_size_bytes
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          artworkId,
          'preview_gif',
          gifStoragePath,
          gifUploadResult.url,
          'image/gif',
          gifBuffer.byteLength,
        ]
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Cel #${celCode} (${title}) successfully minted to studioNeo Digital Archive.`,
        cel: {
          id: artworkId,
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
