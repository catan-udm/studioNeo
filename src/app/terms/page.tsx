import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import StudioFooter from '../components/StudioFooter';
import './terms.css';

export const metadata: Metadata = {
  title: 'Terms of Service • studioNeo',
  description:
    'Terms of Service, artist intellectual property reservations, passkey authentication guidelines, and curatorial standards for studioNeo.',
  alternates: {
    canonical: 'https://studioneo.tech/terms',
  },
  openGraph: {
    title: 'Terms of Service • studioNeo',
    description:
      'Terms of Service, artist intellectual property reservations, passkey authentication guidelines, and curatorial standards for studioNeo.',
    url: 'https://studioneo.tech/terms',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service • studioNeo',
    description:
      'Terms of Service, artist intellectual property reservations, passkey authentication guidelines, and curatorial standards for studioNeo.',
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
        'Terms of Service, artist intellectual property reservations, passkey authentication guidelines, and curatorial standards for studioNeo.',
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
            Governing agreements for accessing the studioNeo digital archive, respecting individual artist content rights,
            and utilizing passwordless WebAuthn cryptographic credentials.
          </p>
          <div className="terms-meta-badge">
            <span>
              EFFECTIVE: <time dateTime="2026-03-01">MARCH 2026</time>
            </span>
            <span>&bull;</span>
            <span>VERSION 3.0</span>
          </div>
        </section>

        {/* 2. Content Card */}
        <div className="terms-container">
          <article className="terms-content-card">
            {/* Section 1 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">01</span>
                <h2 className="terms-section-title">Acceptance of Terms</h2>
              </div>
              <p>
                By accessing, browsing, or interacting with the studioNeo digital archive (&ldquo;the Atelier&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), you acknowledge that
                you have read, understood, and agreed to be bound by these Terms of Service, along with our{' '}
                <Link href="/privacy" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Privacy Policy</Link> and{' '}
                <Link href="/licensing" style={{ textDecoration: 'underline', color: 'var(--text-primary)' }}>Content Rights &amp; Distribution Policy</Link>.
              </p>
              <p>
                If you are accepting these Terms on behalf of an agency, studio, or corporate entity, you represent
                and warrant that you possess full legal authority to bind that entity to these commitments.
              </p>
            </div>

            {/* Section 2 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">02</span>
                <h2 className="terms-section-title">Artist Intellectual Property &amp; Distribution Restrictions</h2>
              </div>
              <p>
                {"Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist."}
              </p>
              <ul>
                <li>
                  <strong>Exclusive Creator Sovereignty:</strong> All visual artworks, illustrations, character designs, and vector stems referenced or exhibited on this platform remain the exclusive intellectual property of their respective individual artists.
                </li>
                <li>
                  <strong>Distribution Restrictions:</strong> Master files and downloadable stems are restricted solely to designated &ldquo;Featured&rdquo; artist collaborations with explicit creator authorization.
                </li>
                <li>
                  <strong>Attribution &amp; Integrity:</strong> Visitors must respect all embedded artist signatures, copyright notices, and official portfolio attributions. Commercial reproduction or derivative exploitation without direct clearance from the individual artist is strictly prohibited.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">03</span>
                <h2 className="terms-section-title">Curatorial Exhibition &amp; User Accounts</h2>
              </div>
              <p>
                User accounts on studioNeo are provided at no cost solely for personal cryptographic identity verification, hardware-backed passkey security, device theme synchronization, and saving personal curatorial bookmarks.
              </p>
              <div className="terms-highlight-box">
                <strong>No Distribution Rights Conveyed:</strong> Registering or signing into a studioNeo account conveys no license or right to copy, distribute, download, or commercially exploit illustrator works. All works are exhibited for curatorial study and cultural appreciation.
              </div>
              <p>
                Automated scraping, unauthorized extraction of artworks, or attempting to circumvent curatorial access controls is strictly prohibited and constitutes immediate grounds for account revocation.
              </p>
            </div>

            {/* Section 4 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">04</span>
                <h2 className="terms-section-title">FIDO2 Passkeys &amp; Cryptographic Identity</h2>
              </div>
              <p>
                studioNeo operates a zero-knowledge, passwordless authentication pipeline. Your biometric indicators (such as
                fingerprints or facial scans) remain encrypted inside your hardware security enclave and are never accessible
                to or stored on our servers.
              </p>
              <p>
                You are responsible for maintaining control of registered authenticators. We encourage linking at least two
                passkeys (e.g., mobile device and desktop security key) to safeguard persistent access.
              </p>
            </div>

            {/* Section 5 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">05</span>
                <h2 className="terms-section-title">Authorized Featured Deliverables &amp; Finality</h2>
              </div>
              <p>
                Where a designated &ldquo;Featured&rdquo; artist has explicitly authorized downloadable study stems or cryptographic certificates of authenticity on studioNeo, such files are provided as-is under the creator&apos;s specified terms.
              </p>
              <p>
                In the rare event of technical file corruption or broken attribution links, our curatorial desk will
                promptly update or restore the record upon notification.
              </p>
            </div>

            {/* Section 6 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">06</span>
                <h2 className="terms-section-title">Governing Law &amp; Curatorial Inquiries</h2>
              </div>
              <p>
                These Terms shall be interpreted and governed by international digital copyright conventions and standards.
                For artist takedown requests, attribution updates, or curatorial inquiries, please direct communications
                to our curatorial desk at{' '}
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
