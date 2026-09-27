import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'bikko.studio • Creative Code, Kinetic Motion & Next-Gen Identity',
  description:
    'Creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey authentication.',
  alternates: {
    canonical: 'https://bikko.studio',
  },
  openGraph: {
    title: 'bikko.studio • Creative Code, Kinetic Motion & Next-Gen Identity',
    description:
      'Algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkeys.',
    url: 'https://bikko.studio',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bikko.studio • Creative Code, Kinetic Motion & Next-Gen Identity',
    description:
      'Algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkeys.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://bikko.studio/#webpage',
  url: 'https://bikko.studio',
  name: 'bikko.studio • Creative Code, Kinetic Motion & Next-Gen Identity',
  description:
    'Creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey authentication.',
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