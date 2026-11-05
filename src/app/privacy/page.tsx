import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import StudioFooter from '../components/StudioFooter';
import './privacy.css';

export const metadata: Metadata = {
  title: 'Privacy & Cryptographic Policy • studioNeo',
  description:
    'Zero-knowledge biometric passkeys, minimal telemetry, TOTP multi-factor security, and cryptographic data protection principles at studioNeo.',
  alternates: {
    canonical: 'https://studioneo.tech/privacy',
  },
  openGraph: {
    title: 'Privacy Policy • studioNeo',
    description:
      'Zero-knowledge biometric passkeys, minimal telemetry, TOTP multi-factor security, and cryptographic data protection principles at studioNeo.',
    url: 'https://studioneo.tech/privacy',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy • studioNeo',
    description:
      'Zero-knowledge biometric passkeys, minimal telemetry, TOTP multi-factor security, and cryptographic data protection principles at studioNeo.',
  },
};

const privacyStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://studioneo.tech/privacy/#webpage',
      url: 'https://studioneo.tech/privacy',
      name: 'Privacy Policy • studioNeo',
      description:
        'Zero-knowledge biometric passkeys, minimal telemetry, TOTP multi-factor security, and cryptographic data protection principles at studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/privacy/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://studioneo.tech',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Privacy Policy',
          item: 'https://studioneo.tech/privacy',
        },
      ],
    },
  ],
};

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyStructuredData) }}
      />
      <main id="main-content" className="privacy-page">
        {/* 1. Hero Header */}
        <section className="privacy-hero" aria-labelledby="privacy-heading">
          <span className="privacy-overline">SECURITY &amp; DATA PROTECTION</span>
          <h1 id="privacy-heading" className="privacy-title">
            Privacy Policy
          </h1>
          <p className="privacy-lead">
            Our architectural pledge: zero tracking cookies, zero stored biometric indicators, encrypted authentication secrets,
            and complete mathematical transparency across every user interaction.
          </p>
          <div className="privacy-meta-badge">
            <span>SECURED BY FIDO2 / WEBAUTHN</span>
            <span>&bull;</span>
            <span>
              REVISED <time dateTime="2026-11-01">NOVEMBER 2026</time>
            </span>
            <span>&bull;</span>
            <span>VERSION 3.2</span>
          </div>
        </section>

        {/* 2. Content Card */}
        <div className="privacy-container">
          <article className="privacy-content-card">
            {/* Section 1 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">01</span>
                <h2 className="privacy-section-title">Zero-Knowledge Biometric Identity</h2>
              </div>
              <p>
                studioNeo was engineered from its foundation to reject password databases and vulnerable credentials. When you authenticate
                using Touch ID, Face ID, Windows Hello, or a hardware security key (such as a YubiKey), your biometric data is computed
                exclusively inside your device&rsquo;s hardware Secure Enclave or Trusted Execution Environment.
              </p>
              <p>
                Our servers receive only an asymmetric cryptographic signature verifying that a challenge was signed by your private key.
                We never receive, inspect, collect, or store your fingerprints, facial geometry, or biometric templates.
              </p>

              <div className="privacy-specs-grid">
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">AUTHENTICATION STANDARD</span>
                  <span className="privacy-spec-val">WebAuthn / FIDO2 Level 3</span>
                </div>
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">SUPPORTED CURVES</span>
                  <span className="privacy-spec-val">Ed25519 &amp; ES256</span>
                </div>
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">BIOMETRIC EXPOSURE</span>
                  <span className="privacy-spec-val">0% Biometrics Stored</span>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">02</span>
                <h2 className="privacy-section-title">Account Data Collected &amp; Cryptographic Storage</h2>
              </div>
              <p>
                When creating or accessing an account on studioNeo, we collect only the minimal data points necessary
                for authentication and service integrity:
              </p>
              <ul>
                <li>
                  <strong>Verified Email Address:</strong> Used solely to issue ephemeral numeric OTP verification tokens, deliver essential
                  security notices, and handle account recovery requests.
                </li>
                <li>
                  <strong>Public Passkey Credentials:</strong> Stored public key bytes, credential IDs, and monotonically increasing sign counters
                  used by WebAuthn to detect credential cloning.
                </li>
                <li>
                  <strong>Two-Factor Authentication (TOTP):</strong> Cryptographic TOTP shared secrets are encrypted at rest using AES-256-GCM.
                  Emergency recovery backup codes are stored strictly as one-way SHA-256 hashes and marked as consumed immediately upon use.
                </li>
                <li>
                  <strong>Federated OAuth Identity (Optional):</strong> If you authenticate using Google or Microsoft accounts, we store only the unique
                  provider identifier to maintain your federated link without accessing your external account contents.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">03</span>
                <h2 className="privacy-section-title">Feed Interactions, Stories &amp; Local Storage</h2>
              </div>
              <p>
                studioNeo employs a local-first client architecture combined with privacy-respecting community interaction storage:
              </p>
              <ul>
                <li>
                  <strong>Likes &amp; Heart Reactions:</strong> Post and story likes are recorded in normalized database tables to maintain
                  accurate artwork reaction counts and enable your personal collection bookmarker. These records are tied to your account ID or an anonymized
                  visitor identifier to prevent duplicate voting.
                </li>
                <li>
                  <strong>Client Preferences &amp; Dock State:</strong> Navigation docking preferences (e.g. `bikko_mobile_dock`), dark/light theme choices,
                  and client auth state are stored locally on your device in standard `localStorage`, allowing you to reset or purge them at any time.
                </li>
                <li>
                  <strong>Secure Session Cookies:</strong> Active sessions utilize encrypted, HTTP-only, `SameSite=Lax` cookies with HMAC signatures
                  (`auth_token`) solely to authenticate API requests and preserve session continuity.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">04</span>
                <h2 className="privacy-section-title">Zero Tracking &amp; No Data Monetization</h2>
              </div>
              <p>
                We believe creative spaces should be free from behavioral surveillance:
              </p>
              <ul>
                <li>
                  <strong>Zero Third-Party Trackers:</strong> studioNeo does not embed marketing pixels, cross-site tracking beacons,
                  or third-party behavioral analytics tools.
                </li>
                <li>
                  <strong>No Data Brokerage:</strong> We never sell, lease, exchange, or broker visitor or user personal information to
                  advertising networks, data brokers, or commercial third parties.
                </li>
                <li>
                  <strong>Temporary Blob Delivery:</strong> Where master cels are downloaded for authorized partner artists, file links are generated
                  as time-limited Shared Access Signature (SAS) URLs that expire shortly after generation.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">05</span>
                <h2 className="privacy-section-title">Data Subject Rights (GDPR &amp; CCPA/CPRA)</h2>
              </div>
              <p>
                Regardless of your geographic location, studioNeo honors universal digital rights over your personal data:
              </p>
              <ul>
                <li>
                  <strong>Right to Erasure (Forget Me):</strong> You can permanently purge your user profile, revoke all registered passkeys,
                  and delete associated session records at any time through your Dashboard or by contacting the curatorial desk.
                </li>
                <li>
                  <strong>Right to Access &amp; Portability:</strong> You have the right to request a complete machine-readable export of all
                  account records, passkey public keys, and curatorial bookmarks associated with your identity.
                </li>
                <li>
                  <strong>Right to Rectification:</strong> You may update your linked authenticators, regenerate TOTP recovery backup codes,
                  or detach third-party login providers directly from your account settings.
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">06</span>
                <h2 className="privacy-section-title">Security Inquiries &amp; Curatorial Desk</h2>
              </div>
              <p>
                If you have questions regarding our cryptographic protections, wish to exercise your data subject rights,
                or wish to report a security vulnerability, please contact our curatorial team directly at{' '}
                <Link href="/contact" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>curator@studioneo.tech</Link>.
              </p>
            </div>
          </article>
        </div>

        {/* 3. Footer */}
        <StudioFooter className="privacy-footer" />
      </main>
    </>
  );
}
