import type { Metadata } from 'next';
import StudioUploadClient from './StudioUploadClient';

export const metadata: Metadata = {
  title: 'Creator Cel Upload & Minting Studio • bikko.studio',
  description:
    'Dedicated minting atelier for verified studioNeo resident artists and illustrators. Upload lossless SVG vector masters and kinetic animated loops with Azure Blob Storage persistence.',
  alternates: {
    canonical: 'https://bikko.studio/studio/upload',
  },
  openGraph: {
    title: 'Creator Cel Upload & Minting Studio • bikko.studio',
    description:
      'Dedicated minting atelier for verified studioNeo resident artists and illustrators.',
    url: 'https://bikko.studio/studio/upload',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Cel Upload & Minting Studio • bikko.studio',
    description:
      'Dedicated minting atelier for verified studioNeo resident artists and illustrators.',
  },
};

export default function StudioUploadPage() {
  return <StudioUploadClient />;
}
