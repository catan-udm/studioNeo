import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Studio Settings • bikko.studio',
  description:
    'Configure real-time appearance themes, typography scaling, fluid kinetic dynamics, and local cache preferences.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
