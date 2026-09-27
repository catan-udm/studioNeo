import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Studio • Commissions & Curation Desk • bikko.studio',
  description:
    'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and physical exhibition print acquisitions.',
  alternates: {
    canonical: 'https://bikko.studio/contact',
  },
  openGraph: {
    title: 'Contact Studio • bikko.studio',
    description:
      'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and exhibition print acquisitions.',
    url: 'https://bikko.studio/contact',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Studio • bikko.studio',
    description:
      'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and exhibition print acquisitions.',
  },
};

const contactStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': 'https://bikko.studio/contact/#webpage',
      url: 'https://bikko.studio/contact',
      name: 'Contact Studio • bikko.studio',
      description:
        'Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and physical exhibition print acquisitions.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/contact/#breadcrumb',
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
          name: 'Contact',
          item: 'https://bikko.studio/contact',
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
