import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Account & Passkey Settings • studioNeo',
  description: 'Manage biometric passkeys, cryptographic account security, and saved studio preferences.',
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
