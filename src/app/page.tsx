import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive • bikko.studio',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  alternates: {
    canonical: 'https://bikko.studio',
  },
  openGraph: {
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive • bikko.studio',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
    url: 'https://bikko.studio',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive • bikko.studio',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://bikko.studio/#webpage',
  url: 'https://bikko.studio',
  name: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive • bikko.studio',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
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
