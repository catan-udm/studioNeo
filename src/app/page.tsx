import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'A fan-made tribute archive of resident illustrators — sankobite, Rella, tamimoon, Yoneyama Mai, Mika Pikazo, DINO, LAM, Dolman, and tatamipi, powered by studioNeo.',
  alternates: {
    canonical: 'https://bikko.studio',
  },
  openGraph: {
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Curated tribute archives of sankobite, Rella, tamimoon, Yoneyama Mai, Mika Pikazo, DINO, LAM, Dolman, and tatamipi, integrated with studioNeo.',
    url: 'https://bikko.studio',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Curated tribute archives of sankobite, Rella, tamimoon, Yoneyama Mai, Mika Pikazo, DINO, LAM, Dolman, and tatamipi, integrated with studioNeo.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://bikko.studio/#webpage',
  url: 'https://bikko.studio',
  name: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'Tribute archive of resident illustrators — sankobite, Rella, tamimoon, Yoneyama Mai, Mika Pikazo, DINO, LAM, Dolman, and tatamipi, powered by studioNeo.',
  inLanguage: 'en-US',
  isPartOf: {
    '@id': 'https://bikko.studio/#website',
  },
  about: {
    '@id': 'https://bikko.studio/#organization',
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <LandingClient />
    </>
  );
}
