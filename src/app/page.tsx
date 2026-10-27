import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: 'sankobite — ugoira tribute archive さんこばいと | Rella • studioNeo',
  description:
    'A fan-made tribute archive of sankobite — Filipino illustrator, animator and sticker maker (14 hand-drawn ugoira loops from the DECO*27 series, HERO for Magical Mirai 2023, and Poké Miku) alongside Rella — The Artist Archive.',
  alternates: {
    canonical: 'https://bikko.studio',
  },
  openGraph: {
    title: 'sankobite — ugoira tribute archive | Rella — The Artist Archive',
    description:
      '14 hand-drawn looping animations by sankobite and selected illustrations by Rella, integrated with studioNeo.',
    url: 'https://bikko.studio',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'sankobite — ugoira tribute archive | Rella — The Artist Archive',
    description:
      '14 hand-drawn looping animations by sankobite and selected illustrations by Rella, integrated with studioNeo.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://bikko.studio/#webpage',
  url: 'https://bikko.studio',
  name: 'sankobite — ugoira tribute archive さんこばいと | Rella • studioNeo',
  description:
    'Tribute archive of sankobite ugoira animations and Rella illustrations, powered by studioNeo.',
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
