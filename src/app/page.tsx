import type { Metadata } from 'next';
import { getSessionUser } from '@/lib/auth';
import { queryRow, AccountRecord } from '@/lib/db';
import type { AuthSubscriber } from '@/lib/clientAuthCache';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Home • studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  alternates: {
    canonical: 'https://studioneo.tech',
  },
  openGraph: {
    title: 'Home • studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
    url: 'https://studioneo.tech',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': 'https://studioneo.tech/#webpage',
  url: 'https://studioneo.tech',
  name: 'studioNeo • Creative Code, Kinetic Motion & Artist Archive',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity alongside curated tribute archives.',
  inLanguage: 'en-US',
  isPartOf: {
    '@id': 'https://studioneo.tech/#website',
  },
  about: {
    '@id': 'https://studioneo.tech/#organization',
  },
};

export default async function HomePage() {
  const session = await getSessionUser();
  let initialUser: AuthSubscriber | null = null;

  if (session) {
    const accountId = session.accountId ?? session.subscriberId;
    if (accountId) {
      try {
        const account = await queryRow<AccountRecord>(
          'SELECT id, email, handle, display_name, avatar_url, bio, website_url, is_verified, system_role, artist_distinction, created_at FROM accounts WHERE id = ? LIMIT 1',
          [accountId]
        );
        if (account) {
          const derivedRole =
            account.artist_distinction !== 'none'
              ? account.artist_distinction
              : account.system_role;

          let passkeyCount = 0;
          try {
            const pk = await queryRow<{ cnt: number }>(
              'SELECT COUNT(*) as cnt FROM webauthn_credentials WHERE account_id = ?',
              [account.id]
            );
            passkeyCount = Number(pk?.cnt || 0);
          } catch {}

          let twoFactorActive = false;
          try {
            const totp = await queryRow<{ is_active: number }>(
              'SELECT is_active FROM totp_secrets WHERE account_id = ? LIMIT 1',
              [account.id]
            );
            twoFactorActive = totp?.is_active === 1;
          } catch {}

          initialUser = {
            id: Number(account.id),
            email: account.email,
            handle: account.handle,
            displayName: account.display_name,
            avatarUrl: account.avatar_url,
            bio: account.bio,
            is_verified: account.is_verified === 1,
            systemRole: account.system_role,
            artistDistinction: account.artist_distinction,
            role: derivedRole,
            tier: derivedRole,
            twoFactorActive,
            passkeyCount,
            linkedOAuth: [],
            created_at: String(account.created_at),
          };
        }
      } catch (err) {
        console.warn('[HomePage] Failed to fetch account record for initial session:', err);
      }

      if (!initialUser) {
        const fallbackRole = session.role || 'user';
        initialUser = {
          id: Number(accountId),
          email: session.email,
          handle: session.email ? session.email.split('@')[0] : 'user',
          displayName: session.email ? session.email.split('@')[0] : 'User',
          is_verified: session.isVerified,
          role: fallbackRole,
          tier: fallbackRole,
          twoFactorActive: false,
          passkeyCount: 0,
          linkedOAuth: [],
          created_at: new Date().toISOString(),
        };
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      <LandingClient initialUser={initialUser} />
    </>
  );
}
