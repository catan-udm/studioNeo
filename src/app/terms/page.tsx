import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import StudioFooter from '../components/StudioFooter';
import './terms.css';

export const metadata: Metadata = {
  title: 'Terms of Service • studioNeo',
  description:
    'Terms of Service, creator intellectual property sovereignty, feed and story interactions, passkey security, and curatorial standards for studioNeo.',
  alternates: {
    canonical: 'https://studioneo.tech/terms',
  },
  openGraph: {
    title: 'Terms of Service • studioNeo',
    description:
      'Terms of Service, creator intellectual property sovereignty, feed and story interactions, passkey security, and curatorial standards for studioNeo.',
    url: 'https://studioneo.tech/terms',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service • studioNeo',
    description:
      'Terms of Service, creator intellectual property sovereignty, feed and story interactions, passkey security, and curatorial standards for studioNeo.',
  },
};

const termsStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://studioneo.tech/terms/#webpage',
      url: 'https://studioneo.tech/terms',
      name: 'Terms of Service • studioNeo',
      description:
        'Terms of Service, creator intellectual property sovereignty, feed and story interactions, passkey security, and curatorial standards for studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/terms/#breadcrumb',
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
          name: 'Terms of Service',
          item: 'https://studioneo.tech/terms',
        },
      ],
    },
  ],
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsStructuredData) }}
      />
      <main id="main-content" className="terms-page">
        {/* 1. Hero Header */}
        <section className="terms-hero" aria-labelledby="terms-heading">
          <span className="terms-overline">LEGAL TERMS &amp; OPERATING POLICIES</span>
          <h1 id="terms-heading" className="terms-title">
            Terms of Service
          </h1>
          <p className="terms-lead">
            Governing agreements for accessing the studioNeo artist atelier, creator intellectual property sovereignty,
            feed and story interactions, and zero-knowledge cryptographic authentication.
          </p>
          <div className="terms-meta-badge">
            <span>
              EFFECTIVE: <time dateTime="2026-11-01">NOVEMBER 2026</time>
            </span>
            <span>&bull;</span>
            <span>VERSION 3.2</span>
            <span>&bull;</span>
            <span>ARTIST-FIRST ATELIER</span>
          </div>
        </section>

        {/* 2. Content Card */}
        <div className="terms-container">
          <article className="terms-content-card">
            {/* Section 1 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">01</span>
                <h2 className="terms-section-title">Acceptance of Terms &amp; Platform Model</h2>
              </div>
              <p>
                By accessing, browsing, or interacting with the studioNeo digital atelier (&ldquo;studioNeo&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the platform&rdquo;),
                you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, along with our{' '}
                <Link href="/privacy" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Privacy Policy</Link> and{' '}
                <Link href="/licensing" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Content Rights &amp; Distribution Policy</Link>.
              </p>
              <p>
                studioNeo operates as a 100% free, artist-focused digital atelier and curatorial archive. We do not charge subscription fees,
                maintain paywalled memberships, or solicit recurring dues. If you access the platform on behalf of an agency, studio, or corporate entity,
                you represent and warrant that you hold full legal authority to bind that entity to these terms.
              </p>
            </div>

            {/* Section 2 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">02</span>
                <h2 className="terms-section-title">Artist Sovereignty &amp; Content Rights Reservations</h2>
              </div>
              <p>
                Every artist retains absolute sovereignty and control over their creative works:
              </p>
              <div className="terms-highlight-box">
                <strong>Core Creator Covenant:</strong> Each individual artist reserves all rights regarding how their content is used,
                referenced, or exhibited. studioNeo does not own, claim copyright over, or possess the right to distribute illustrator works
                unless explicitly authorized as a designated &ldquo;Partner&rdquo; artist collaboration.
              </div>
              <ul>
                <li>
                  <strong>Exclusive Creator Ownership:</strong> All visual artworks, illustrations, character designs, background concepts,
                  and production stems exhibited on studioNeo remain the exclusive intellectual property of their respective creators.
                </li>
                <li>
                  <strong>Distribution Boundaries:</strong> Downloadable master cels, production assets, and vector stems are strictly
                  restricted to verified &ldquo;Partner&rdquo; artist works (such as certified sankobite master cels) with explicit written creator clearance.
                  All other works are exhibited solely for curatorial study, appreciation, and direct portfolio discovery.
                </li>
                <li>
                  <strong>Prohibition of Generative AI / ML Training:</strong> Scraping, harvesting, downloading, or caching any artwork,
                  story, or visual asset from studioNeo for the purpose of training generative artificial intelligence, machine learning models,
                  or diffusion algorithms is strictly prohibited without direct, express, written clearance from the individual artist.
                </li>
                <li>
                  <strong>Attribution &amp; Signature Integrity:</strong> Visitors must preserve all embedded artist signatures, copyright stamps,
                  and links to official creator channels. Commercial exploitation, unauthorized derivative works, or re-hosting without direct creator consent is strictly forbidden.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">03</span>
                <h2 className="terms-section-title">Community Feeds, Stories &amp; Interactions</h2>
              </div>
              <p>
                studioNeo provides an interactive Home feed (`/`) and dynamic Story viewers showcasing recent releases from featured and partner creators:
              </p>
              <ul>
                <li>
                  <strong>Feed &amp; Story Appreciation:</strong> Users may view ephemeral story reels, navigate through featured post feeds, and register likes
                  (via single-tap or double-tap) to express community appreciation and curate personal bookmark collections.
                </li>
                <li>
                  <strong>Master Cel Downloads:</strong> Download options within the story viewer or feed are strictly limited to authorized Partner artworks.
                  Attempting to bypass access gates or reverse-engineer private blob storage endpoints constitutes a violation of these Terms.
                </li>
                <li>
                  <strong>Automated Access &amp; Scraping Prohibitions:</strong> You agree not to deploy automated crawlers, bots, headless scrapers,
                  or high-frequency scripts to harvest feed contents, manipulate like counts, or degrade service performance for other visitors.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">04</span>
                <h2 className="terms-section-title">Cryptographic User Accounts &amp; Access Controls</h2>
              </div>
              <p>
                User accounts on studioNeo are provided at zero cost solely for personal cryptographic identity verification, hardware-backed passkey management,
                display preference synchronization, and curating personal bookmarks.
              </p>
              <ul>
                <li>
                  <strong>Zero License Conveyed:</strong> Registering or signing into a studioNeo account conveys no intellectual property license,
                  reproduction permit, or distribution right over exhibited creator works.
                </li>
                <li>
                  <strong>Creator &amp; Curator Studio Gating:</strong> Uploading artworks or managing gallery metadata via the Creator Studio
                  (`/api/studio/upload`) is strictly reserved for verified artists and atelier curators. Attempting to spoof curatorial roles or bypass tier gates
                  will result in immediate credential revocation.
                </li>
                <li>
                  <strong>Account Custody:</strong> You are solely responsible for maintaining control of your registered authenticators, email access,
                  and emergency backup recovery codes.
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">05</span>
                <h2 className="terms-section-title">Passwordless Authentication &amp; Multi-Factor Security</h2>
              </div>
              <p>
                studioNeo operates a modern, password-free security architecture:
              </p>
              <ul>
                <li>
                  <strong>FIDO2 / WebAuthn Biometric Passkeys:</strong> When authenticating via Touch ID, Face ID, or hardware security keys,
                  your biometric credentials remain encrypted inside your hardware security enclave and are never transmitted to or stored on our servers.
                </li>
                <li>
                  <strong>Email One-Time Passwords (OTP):</strong> Cryptographic 6-digit numeric verification tokens delivered via email expire automatically
                  after 10 minutes and are hashed with SHA-256 before verification.
                </li>
                <li>
                  <strong>Two-Factor Authentication (TOTP):</strong> Users may activate rolling 6-digit TOTP verification apps along with single-use
                  recovery backup codes to protect account recovery.
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">06</span>
                <h2 className="terms-section-title">Service Availability &amp; Deliverables</h2>
              </div>
              <p>
                studioNeo is provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. While we strive for 99.9% uptime and high-performance
                client-side rendering, we do not warrant uninterrupted operation or that archived portfolio links will remain permanently online if an artist
                requests modifications or unpublishing.
              </p>
            </div>

            {/* Section 7 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">07</span>
                <h2 className="terms-section-title">Notice, Takedown &amp; Curatorial Inquiries</h2>
              </div>
              <p>
                studioNeo respects copyright law and the moral rights of creators worldwide. If you are an artist or legal representative and believe
                an artwork is exhibited without authorization or requires attribution correction, please contact our curatorial desk immediately.
              </p>
              <p>
                Direct all takedown notices, attribution amendments, and curatorial partnership inquiries to{' '}
                <Link href="/contact" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>curator@studioneo.tech</Link>.
              </p>
            </div>
          </article>
        </div>

        {/* 3. Footer */}
        <StudioFooter className="terms-footer" />
      </main>
    </>
  );
}
