import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects & Key Works • Animated Cuts & Vector Topologies • studioNeo',
  description:
    'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
  alternates: {
    canonical: 'https://studioneo.tech/projects',
  },
  openGraph: {
    title: 'Projects & Key Works • studioNeo',
    description:
      'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
    url: 'https://studioneo.tech/projects',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects & Key Works • studioNeo',
    description:
      'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
  },
};

const projectsStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': 'https://studioneo.tech/projects/#webpage',
      url: 'https://studioneo.tech/projects',
      name: 'Projects & Key Works • studioNeo',
      description:
        'Experimental animated cuts, looped character stickers, and interactive media frames curated by studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/projects/#breadcrumb',
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
          name: 'Projects',
          item: 'https://studioneo.tech/projects',
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
