import type { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'Gallery Archive • 128 Algorithmic Kinetic Cels • bikko.studio',
  description:
    'Curated archive of 128 algorithmic kinetic motion cels, lossless SVG vector stems, and cryptographic editions by resident artists.',
  alternates: {
    canonical: 'https://bikko.studio/gallery',
  },
  openGraph: {
    title: 'Gallery Archive • bikko.studio',
    description:
      'Curated archive of 128 algorithmic kinetic motion cels, lossless SVG vector stems, and cryptographic editions.',
    url: 'https://bikko.studio/gallery',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery Archive • bikko.studio',
    description:
      'Curated archive of 128 algorithmic kinetic motion cels, lossless SVG vector stems, and cryptographic editions.',
  },
};

const galleryStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://bikko.studio/gallery/#webpage',
      url: 'https://bikko.studio/gallery',
      name: 'Gallery Archive • 128 Algorithmic Kinetic Cels',
      description:
        'Curated archive of 128 algorithmic kinetic motion cels, lossless SVG vector stems, and cryptographic editions.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/gallery/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://bikko.studio',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Gallery Archive',
          item: 'https://bikko.studio/gallery',
        },
      ],
    },
  ],
};

export default function GalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryStructuredData) }}
      />
      <GalleryClient />
    </>
  );
}
