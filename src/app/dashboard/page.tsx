import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Subscriber Dashboard • bikko.studio',
  description: 'Manage biometric passkeys, account security, and unlocked digital perks.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
