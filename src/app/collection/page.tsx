import type { Metadata } from 'next';
import CollectionClient from './CollectionClient';

export const metadata: Metadata = {
  title: 'Saved Collection • Curated Personal Archive • bikko.studio',
  description:
    'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
  alternates: {
    canonical: 'https://bikko.studio/collection',
  },
  openGraph: {
    title: 'Saved Collection • bikko.studio',
    description:
      'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
    url: 'https://bikko.studio/collection',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saved Collection • bikko.studio',
    description:
      'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
  },
};

const collectionStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://bikko.studio/collection/#webpage',
      url: 'https://bikko.studio/collection',
      name: 'Saved Collection • bikko.studio',
      description:
        'Curated personal archive collection of saved algorithmic cels, vector stems, and cryptographic editions.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/collection/#breadcrumb',
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
          name: 'Collection',
          item: 'https://bikko.studio/collection',
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
