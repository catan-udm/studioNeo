import type { Metadata } from 'next';
import StudioUploadClient from './StudioUploadClient';

export const metadata: Metadata = {
  title: 'Creator Cel Upload & Minting Studio • studioNeo',
  description:
    'Dedicated minting atelier for verified studioNeo resident artists and illustrators. Upload lossless SVG vector masters and kinetic animated loops with Azure Blob Storage persistence.',
  alternates: {
    canonical: 'https://studioneo.tech/studio/upload',
  },
  openGraph: {
    title: 'Creator Cel Upload & Minting Studio • studioNeo',
    description:
      'Dedicated minting atelier for verified studioNeo resident artists and illustrators.',
    url: 'https://studioneo.tech/studio/upload',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creator Cel Upload & Minting Studio • studioNeo',
    description:
      'Dedicated minting atelier for verified studioNeo resident artists and illustrators.',
  },
};

export default function StudioUploadPage() {
  return <StudioUploadClient />;
}
