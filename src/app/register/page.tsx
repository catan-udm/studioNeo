import type { Metadata } from 'next';
import AuthSlider from '@/app/components/AuthSlider';
import './register.css';

export const metadata: Metadata = {
  title: 'Register • studioNeo • Passkey & Cryptographic Identity',
  description:
    'Create a studioNeo cryptographic identity account with biometric passkeys, device theme sync, and saved bookmarks.',
  alternates: {
    canonical: 'https://studioneo.tech/register',
  },
  openGraph: {
    title: 'Register • studioNeo • Passkey & Cryptographic Identity',
    description:
      'Create a studioNeo cryptographic identity account with biometric passkeys, device theme sync, and saved bookmarks.',
    url: 'https://studioneo.tech/register',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary',
    title: 'Register • studioNeo • Passkey & Cryptographic Identity',
    description:
      'Create a studioNeo cryptographic identity account with biometric passkeys, device theme sync, and saved bookmarks.',
  },
};

export default function RegisterPage() {
  return <AuthSlider initialMode="register" />;
}
