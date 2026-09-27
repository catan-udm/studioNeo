import type { Metadata } from 'next';
import AuthSlider from '@/app/components/AuthSlider';
import './login.css';

export const metadata: Metadata = {
  title: 'Sign In • Passkey & Passwordless Authentication • bikko.studio',
  description:
    'Sign in securely with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
  alternates: {
    canonical: 'https://bikko.studio/login',
  },
  openGraph: {
    title: 'Sign In • bikko.studio',
    description:
      'Sign in securely with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
    url: 'https://bikko.studio/login',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary',
    title: 'Sign In • bikko.studio',
    description:
      'Sign in securely with biometric WebAuthn passkeys, Touch ID, Face ID, Windows Hello, or Magic Link OTP.',
  },
};

export default function LoginPage() {
  return <AuthSlider initialMode="login" />;
}