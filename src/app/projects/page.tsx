import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects & Key Works • Animated Cuts & Vector Topologies • bikko.studio',
  description:
    'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
  alternates: {
    canonical: 'https://bikko.studio/projects',
  },
  openGraph: {
    title: 'Projects & Key Works • bikko.studio',
    description:
      'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
    url: 'https://bikko.studio/projects',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects & Key Works • bikko.studio',
    description:
      'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
  },
};

const projectsStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://bikko.studio/projects/#webpage',
      url: 'https://bikko.studio/projects',
      name: 'Projects & Key Works • bikko.studio',
      description:
        'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/projects/#breadcrumb',
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
          name: 'Projects',
          item: 'https://bikko.studio/projects',
        },
      ],
    },
  ],
};

export default function ProjectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsStructuredData) }}
      />
      <ProjectsClient />
    </>
  );
}
