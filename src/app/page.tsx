import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'Home • studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  alternates: {
    canonical: 'https://studioneo.tech',
  },
  openGraph: {
    title: 'Home • studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
    url: 'https://studioneo.tech',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://studioneo.tech/#webpage',
  url: 'https://studioneo.tech',
  name: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  inLanguage: 'en-US',
  isPartOf: {
    '@id': 'https://studioneo.tech/#website',
  },
  about: {
    '@id': 'https://studioneo.tech/#organization',
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
