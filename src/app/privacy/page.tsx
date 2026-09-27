import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './privacy.css';

export const metadata: Metadata = {
  title: 'Privacy & Cryptographic Policy • bikko.studio',
  description:
    'Zero-knowledge biometric passkeys, minimal telemetry, and cryptographic data protection principles at studioNeo.',
  alternates: {
    canonical: 'https://bikko.studio/privacy',
  },
  openGraph: {
    title: 'Privacy Policy • bikko.studio',
    description:
      'Zero-knowledge biometric passkeys, minimal telemetry, and cryptographic data protection principles at studioNeo.',
    url: 'https://bikko.studio/privacy',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy • bikko.studio',
    description:
      'Zero-knowledge biometric passkeys, minimal telemetry, and cryptographic data protection principles at studioNeo.',
  },
};

const privacyStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://bikko.studio/privacy/#webpage',
      url: 'https://bikko.studio/privacy',
      name: 'Privacy Policy • bikko.studio',
      description:
        'Zero-knowledge biometric passkeys, minimal telemetry, and cryptographic data protection principles at studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/privacy/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://bikko.studio',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Privacy Policy',
          item: 'https://bikko.studio/privacy',
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
            Our architectural pledge: zero tracking cookies, zero stored biometric indicators,
            and complete mathematical transparency across every subscriber interaction.
          </p>
          <div className="privacy-meta-badge">
            <span>SECURED BY FIDO2 / WEBAUTHN</span>
            <span>&bull;</span>
            <span>
              REVISED <time dateTime="2026-03-01">MARCH 2026</time>
            </span>
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
                bikko.studio was built from day one to reject vulnerable password databases. When you authenticate using Touch ID,
                Face ID, Windows Hello, or a YubiKey, your biometric information is processed exclusively within your device&rsquo;s
                hardware Secure Enclave or Trusted Execution Environment.
              </p>
              <p>
                Our servers receive only a public asymmetric cryptographic signature confirming authenticator ownership. We never
                see, collect, or store your biometric scans.
              </p>

              <div className="privacy-specs-grid">
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">AUTHENTICATION</span>
                  <span className="privacy-spec-val">WebAuthn / FIDO2 Level 3</span>
                </div>
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">CRYPTOGRAPHIC CURVE</span>
                  <span className="privacy-spec-val">Ed25519 &amp; ES256</span>
                </div>
                <div className="privacy-spec-card">
                  <span className="privacy-spec-title">DATA EXPOSURE</span>
                  <span className="privacy-spec-val">0% Biometrics Stored</span>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">02</span>
                <h2 className="privacy-section-title">Telemetry &amp; Local-First Storage</h2>
              </div>
              <p>
                We believe in respectful digital environments. studioNeo does not utilize third-party behavioral trackers,
                cross-site marketing beacons, or invasive tracking scripts.
              </p>
              <ul>
                <li>
                  <strong>Saved Collections &amp; Favorites:</strong> Your curated gallery saves, heart favorites, and display
                  preferences are stored locally on your device in standard <code>localStorage</code>, giving you full control
                  to clear your collection at any moment.
                </li>
                <li>
                  <strong>Session Tokens:</strong> Active subscriber sessions use encrypted, HTTP-only, SameSite=Strict cookies
                  solely for verifying membership and download entitlement.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">03</span>
                <h2 className="privacy-section-title">Subscriber Information Collected</h2>
              </div>
              <p>
                When subscribing to archive tiers or registering a collector profile, we collect only the minimal data points
                essential to fulfill digital asset delivery:
              </p>
              <ul>
                <li>
                  <strong>Verified Email Address:</strong> Used for transactional notifications, billing receipts, and account
                  recovery challenges.
                </li>
                <li>
                  <strong>Passkey Public Credentials:</strong> Cryptographic public keys and credential IDs to identify authorized
                  hardware authenticators.
                </li>
                <li>
                  <strong>Linked Providers (Optional):</strong> If you choose to link Google or Microsoft identities, we store only
                  the provider account identifier to facilitate passwordless OAuth federation.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">04</span>
                <h2 className="privacy-section-title">Data Subject Rights (GDPR &amp; CCPA)</h2>
              </div>
              <p>
                Regardless of your jurisdiction, you enjoy uninhibited rights over your digital presence in our atelier:
              </p>
              <ul>
                <li>
                  <strong>Right to Erasure (Forget Me):</strong> You can delete your subscriber profile and detach all registered
                  passkeys instantly through your Dashboard or by submitting a curatorial request.
                </li>
                <li>
                  <strong>Right to Export:</strong> You can download a complete JSON manifest of your account records, linked
                  credentials, and acquired cel hashes at any time.
                </li>
                <li>
                  <strong>No Data Brokerage:</strong> We never sell, rent, or monetize collector or subscriber information to
                  external brokers or advertising networks.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="privacy-article-section">
              <div className="privacy-section-header">
                <span className="privacy-section-num">05</span>
                <h2 className="privacy-section-title">Security Inquiries &amp; Curatorial Desk</h2>
              </div>
              <p>
                For privacy disclosures, vulnerability reports, or data deletion confirmations, reach our security desk directly at{' '}
                <Link href="/contact" style={{ textDecoration: 'underline', color: '#000' }}>contact@bikko.studio</Link>.
              </p>
            </div>
          </article>
        </div>

        {/* 3. Footer */}
        <footer className="privacy-footer">
          <div className="footer-links-row">
            <Link href="/gallery" className="footer-link">Archive Index</Link>
            <Link href="/collection" className="footer-link">Saved Collection</Link>
            <Link href="/about" className="footer-link">Curatorial Statement</Link>
            <Link href="/licensing" className="footer-link">Licensing &amp; Rights</Link>
            <Link href="/membership" className="footer-link">Membership Tiers</Link>
            <Link href="/projects" className="footer-link">Projects &amp; Cuts</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/contact" className="footer-link">Contact Studio</Link>
          </div>
          <div className="footer-bottom-copy">
            <span>&copy; <time dateTime="2026">2026</time> studioNeo Archive. All curation rights preserved.</span>
            <span>bikko.studio visual engineering</span>
          </div>
        </footer>
      </main>
    </>
  );
}
