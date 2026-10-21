import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us • Commissions & Curation Desk • studioneo.tech',
  description:
    'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and physical exhibition print acquisitions.',
  alternates: {
    canonical: 'https://studioneo.tech/contact',
  },
  openGraph: {
    title: 'Contact Us • studioneo.tech',
    description:
      'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and exhibition print acquisitions.',
    url: 'https://studioneo.tech/contact',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioneo.tech',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us • studioneo.tech',
    description:
      'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and exhibition print acquisitions.',
  },
};

const contactStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': 'https://studioneo.tech/contact/#webpage',
      url: 'https://studioneo.tech/contact',
      name: 'Contact Us • studioneo.tech',
      description:
        'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and physical exhibition print acquisitions.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/contact/#breadcrumb',
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
          name: 'Contact',
          item: 'https://studioneo.tech/contact',
        },
      ],
    },
  ],
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactStructuredData) }}
      />
      <ContactClient />
    </>
  );
}
