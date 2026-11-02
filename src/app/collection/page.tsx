import type { Metadata } from 'next';
import CollectionClient from './CollectionClient';

export const metadata: Metadata = {
  title: 'Saved Collection • Curated Personal Archive • studioNeo',
  description:
    'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
  alternates: {
    canonical: 'https://studioneo.tech/collection',
  },
  openGraph: {
    title: 'Saved Collection • studioNeo',
    description:
      'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
    url: 'https://studioneo.tech/collection',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saved Collection • studioNeo',
    description:
      'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
  },
};

const collectionStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://studioneo.tech/collection/#webpage',
      url: 'https://studioneo.tech/collection',
      name: 'Saved Collection • studioNeo',
      description:
        'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/collection/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://studioneo.tech',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collection',
          item: 'https://studioneo.tech/collection',
        },
      ],
    },
  ],
};

export default function CollectionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
      <CollectionClient />
    </>
  );
}
