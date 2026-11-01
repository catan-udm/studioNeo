import type { Metadata } from 'next';
import GalleryClient from '../gallery/GalleryClient';

export const metadata: Metadata = {
  title: 'Store • Original Cels, Prints & Vector Stems • bikko.studio',
  description:
    'Acquire original kinetic motion cels, collector prints, lossless SVG vector stems, and commercial studio licenses.',
  alternates: {
    canonical: 'https://bikko.studio/store',
  },
};

export default function StorePage() {
  return <GalleryClient />;
}
