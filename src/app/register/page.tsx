import type { Metadata } from 'next';
import AuthSlider from '@/app/components/AuthSlider';
import './register.css';

export const metadata: Metadata = {
  title: 'Sign Up • Create Collector Account • bikko.studio',
  description:
    'Register for a bikko.studio account with biometric passkeys or passwordless email verification.',
  alternates: {
    canonical: 'https://bikko.studio/register',
  },
  openGraph: {
    title: 'Sign Up • bikko.studio',
    description:
      'Register for a bikko.studio account with biometric passkeys or passwordless email verification.',
    url: 'https://bikko.studio/register',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary',
    title: 'Sign Up • bikko.studio',
    description:
      'Register for a bikko.studio account with biometric passkeys or passwordless email verification.',
  },
};

export default function RegisterPage() {
  return <AuthSlider initialMode="register" />;
}
