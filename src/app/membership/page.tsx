import type { Metadata } from 'next';
import MembershipClient from './MembershipClient';

export const metadata: Metadata = {
  title: 'Membership Tiers & Subscriber Vaults • bikko.studio',
  description:
    'Direct access to 128 losslessly preserved vector cels, subscriber-only vaults, SVG source stems, and hardware-backed biometric passkey identity.',
  alternates: {
    canonical: 'https://bikko.studio/membership',
  },
  openGraph: {
    title: 'Membership Tiers & Subscriber Vaults • bikko.studio',
    description:
      'Direct access to 128 losslessly preserved vector cels, subscriber-only vaults, SVG source stems, and biometric identity.',
    url: 'https://bikko.studio/membership',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership Tiers & Subscriber Vaults • bikko.studio',
    description:
      'Direct access to 128 losslessly preserved vector cels, subscriber-only vaults, SVG source stems, and biometric identity.',
  },
};

// Schema.org Product / Offer with ISO 4217 Currency (USD) and BreadcrumbList
const membershipStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://bikko.studio/membership/#webpage',
      url: 'https://bikko.studio/membership',
      name: 'Membership Tiers & Archive Access • bikko.studio',
      description:
        'Direct access to 128 losslessly preserved vector cels, subscriber-only vaults, SVG source stems, and hardware-backed biometric identity.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'Product',
      '@id': 'https://bikko.studio/membership/#collector-tier',
      name: 'Archive Member Collector Subscription',
      description:
        'Full 128-work archive, lossless 4K & raw SVG stem downloads, 11 private subscriber vaults, and FIDO2 passkeys.',
      brand: {
        '@id': 'https://bikko.studio/#organization',
      },
      offers: {
        '@type': 'Offer',
        price: '12.00',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://bikko.studio/membership',
      },
    },
    {
      '@type': 'Product',
      '@id': 'https://bikko.studio/membership/#studio-tier',
      name: 'Studio Commercial Lab Subscription',
      description:
        'Full commercial reproduction license, unlimited SVG stems for commercial projects, and multi-seat licensing.',
      brand: {
        '@id': 'https://bikko.studio/#organization',
      },
      offers: {
        '@type': 'Offer',
        price: '49.00',
        priceCurrency: 'USD',
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://bikko.studio/membership',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/membership/#breadcrumb',
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
          name: 'Membership',
          item: 'https://bikko.studio/membership',
        },
      ],
    },
  ],
};

export default function MembershipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(membershipStructuredData) }}
      />
      <MembershipClient />
    </>
  );
}
