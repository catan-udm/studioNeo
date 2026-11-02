import type { Metadata } from 'next';
import ArtistIndexClient from './ArtistIndexClient';

export const metadata: Metadata = {
  title: 'Artists of studioNeo • Illustrator Directory & Resident Archives',
  description:
    'A living directory of the 64 illustrators, image-makers, and visual storytellers behind the studioNeo archive, including resident tribute archives.',
  alternates: {
    canonical: 'https://bikko.studio/artist',
  },
  openGraph: {
    title: 'Artists of studioNeo • Illustrator Directory & Resident Archives',
    description:
      'A living directory of the 64 illustrators, image-makers, and visual storytellers behind the studioNeo archive.',
    url: 'https://bikko.studio/artist',
    type: 'website',
  },
};

export default function ArtistPage() {
  return <ArtistIndexClient />;
}
