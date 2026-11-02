import type { Metadata } from 'next';
import AuthSlider from '@/app/components/AuthSlider';

export const metadata: Metadata = {
  title: 'Sign In • studioNeo • Passkey & Cryptographic Identity',
  description:
    'Sign in securely to studioNeo with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
  alternates: {
    canonical: 'https://studioneo.tech/login',
  },
  openGraph: {
    title: 'Sign In • studioNeo • Passkey & Cryptographic Identity',
    description:
      'Sign in securely to studioNeo with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
    url: 'https://studioneo.tech/login',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In • studioNeo • Passkey & Cryptographic Identity',
    description:
      'Sign in securely to studioNeo with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
  },
};

export default function LoginPage() {
  return <AuthSlider initialMode="login" />;
}
