import type { Metadata } from 'next';
import ArtistProfileClient from './ArtistProfileClient';
import { ArchiveApp } from '@/components/archive/ArchiveApp';
import { RESIDENT_ARTISTS } from '../../gallery/galleryData';

interface ArtistPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { handle } = await params;
  const cleanHandle = (handle || '').toLowerCase().trim();

  if (cleanHandle === 'sankobite') {
    return {
      title: 'sankobite — ugoira tribute archive さんこばいと • studioNeo',
      description:
        'A fan-made tribute archive of sankobite — Filipino illustrator, animator and sticker maker. Every ugoira loop, from the DECO*27 song series to Magical Mirai’s HERO and Poké Miku.',
    };
  }

  if (cleanHandle === 'rella') {
    return {
      title: 'Rella | The Artist Archive • studioNeo',
      description:
        'An independent tribute archive of Rella — illustrator, designer, and storyteller in light (Hatsune Miku Symphony, 15th & 16th anniversary visuals).',
    };
  }

  const resident = RESIDENT_ARTISTS.find((a) => a.handle.toLowerCase() === cleanHandle);
  const artistName = resident
    ? resident.name
    : cleanHandle
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const title = `${artistName} (@${cleanHandle}) • Resident Artist Portfolio • bikko.studio`;
  const description = resident
    ? resident.bio
    : `Curated digital cels, lossless SVG vector stems, and kinetic algorithmic editions by ${artistName} at studioNeo.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://bikko.studio/artist/${cleanHandle}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bikko.studio/artist/${cleanHandle}`,
      type: 'profile',
      locale: 'en_US',
      siteName: 'bikko.studio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { handle } = await params;
  const cleanHandle = (handle || '').toLowerCase().trim();

  if (cleanHandle === 'sankobite') {
    return <ArchiveApp initialArtist="sankobite" />;
  }

  if (cleanHandle === 'rella') {
    return <ArchiveApp initialArtist="rella" />;
  }

  return <ArtistProfileClient handle={handle} />;
}
