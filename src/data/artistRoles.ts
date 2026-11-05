/**
 * Artist distinctions for studioNeo.
 *
 * - `partner`:  authorized collaborative projects; the ONLY artists whose works may be downloaded.
 * - `featured`: curated spotlight showcases; viewing only, all rights reserved by the artist.
 * - `artist`:   normal directory illustrators; viewing / external links only.
 *
 * Account roles (`user`, `artist`, `featured`, `partner`) share this vocabulary, but an
 * account role conveys NO distribution rights by itself.
 */
export type ArtistDistinction = 'partner' | 'featured' | 'artist';

export const PARTNER_HANDLES: ReadonlySet<string> = new Set(['sankobite']);

export const FEATURED_HANDLES: ReadonlySet<string> = new Set([
  'rellakinoko',
  'rella',
  'tami_moon02',
  'tamimoon',
  'yoneyamai',
  'yoneyama_mai',
  'yoneyama',
  'mikapikazo',
  'mika_pikazo',
  'dino_illus',
  'dinoillus',
  'dino',
  'ramdayo1122',
  'ramdayo',
  'lam',
  'dolman4878',
  'dolman',
  'tatamipi',
  'askziye',
  'ask',
  'dora_xxi',
  'dora',
  'kaduise',
  'kda',
]);

export function getArtistDistinction(handle?: string | null): ArtistDistinction {
  const h = (handle || '').trim().toLowerCase();
  if (PARTNER_HANDLES.has(h)) return 'partner';
  if (FEATURED_HANDLES.has(h)) return 'featured';
  return 'artist';
}

export function isPartnerHandle(handle?: string | null): boolean {
  return getArtistDistinction(handle) === 'partner';
}

/** Badge wording shown on artwork cards. Plain artists show no badge. */
export function getArtistBadge(handle?: string | null): 'Partner' | 'Featured' | null {
  const d = getArtistDistinction(handle);
  if (d === 'partner') return 'Partner';
  if (d === 'featured') return 'Featured';
  return null;
}

export const RIGHTS_CLAUSE_ARTIST =
  'Each individual artist reserves the right on how their content is used.';
export const RIGHTS_CLAUSE_DISTRIBUTION =
  'studioNeo does not have the right to distribute illustrator works unless specified as an authorized Partner artist project.';
