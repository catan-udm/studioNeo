import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './terms.css';

export const metadata: Metadata = {
  title: 'Terms of Service • bikko.studio',
  description:
    'Terms of Service, digital asset licensing, passkey authentication guidelines, and curatorial standards for studioNeo.',
  alternates: {
    canonical: 'https://bikko.studio/terms',
  },
  openGraph: {
    title: 'Terms of Service • bikko.studio',
    description:
      'Terms of Service, digital asset licensing, passkey authentication guidelines, and curatorial standards for studioNeo.',
    url: 'https://bikko.studio/terms',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service • bikko.studio',
    description:
      'Terms of Service, digital asset licensing, passkey authentication guidelines, and curatorial standards for studioNeo.',
  },
};

const termsStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://bikko.studio/terms/#webpage',
      url: 'https://bikko.studio/terms',
      name: 'Terms of Service • bikko.studio',
      description:
        'Terms of Service, digital asset licensing, passkey authentication guidelines, and curatorial standards for studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/terms/#breadcrumb',
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
          name: 'Terms of Service',
          item: 'https://bikko.studio/terms',
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
            Governing agreements for accessing the studioNeo digital archive, collecting vector stems,
            utilizing passwordless WebAuthn credentials, and licensing generative kinetic works.
          </p>
          <div className="terms-meta-badge">
            <span>
              EFFECTIVE: <time dateTime="2026-03-01">MARCH 2026</time>
            </span>
            <span>&bull;</span>
            <span>VERSION 2.4</span>
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
                By accessing, browsing, subscribing to, or acquiring digital cels from bikko.studio and the
                studioNeo archive (&ldquo;the Atelier&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;), you acknowledge that
                you have read, understood, and agreed to be bound by these Terms of Service, along with our{' '}
                <Link href="/privacy" style={{ textDecoration: 'underline', color: '#000' }}>Privacy Policy</Link> and{' '}
                <Link href="/licensing" style={{ textDecoration: 'underline', color: '#000' }}>Licensing Framework</Link>.
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
                <h2 className="terms-section-title">Algorithmic Art &amp; Vector Intellectual Property</h2>
              </div>
              <p>
                All visual artifacts, algorithmic kinetic animations, mathematical vector topologies, and SVG source
                stems exhibited on this platform represent the copyrighted intellectual property of studioNeo and its
                resident artists.
              </p>
              <ul>
                <li>
                  <strong>Master Vector Assets:</strong> The downloadable SVG stems are generated via mathematical coordinate
                  matrices. Possession of a vector file does not convey ownership of the underlying generation algorithm.
                </li>
                <li>
                  <strong>Attribution &amp; Integrity:</strong> When displaying public prints or digital cels, you must preserve
                  the embedded artist signature and catalog code tags.
                </li>
                <li>
                  <strong>Derivative Works:</strong> Modifications and remixes are permitted solely under the scope of the Studio
                  Commercial License tier.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="terms-article-section">
              <div className="terms-section-header">
                <span className="terms-section-num">03</span>
                <h2 className="terms-section-title">Subscriber Membership &amp; Vault Access</h2>
              </div>
              <p>
                Subscribers to our Collector ($12 USD/month) and Studio ($49 USD/month) tiers gain non-exclusive access to private
                archive vaults and uncompressed master stems during the active duration of their subscription.
              </p>
              <div className="terms-highlight-box">
                <strong>Billing &amp; Cancellation:</strong> Memberships renew automatically on each billing anniversary.
                You may cancel your subscription at any time via your Subscriber Dashboard. Upon cancellation, you retain
                access to downloaded stems and vault browsing until the conclusion of the prepaid billing cycle.
              </div>
              <p>
                Sharing subscriber credentials, scraping vectors via unauthorized bots, or circumventing member vault
                security is strictly prohibited and constitutes immediate grounds for account revocation.
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
                <h2 className="terms-section-title">Refunds &amp; Digital Deliverable Finality</h2>
              </div>
              <p>
                Because raw SVG source stems and cryptographic certificates of authenticity are immediately unlocked and
                downloadable upon purchase or subscription activation, digital acquisitions are non-refundable once master
                stems have been retrieved.
              </p>
              <p>
                In the rare event of technical file corruption or defective vector renders, our curatorial desk will
                provide an immediate corrected master cel upon notification.
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
                For bespoke licensing requests, custom corporate installations, or legal notices, please direct communications
                to our curatorial desk at{' '}
                <Link href="/contact" style={{ textDecoration: 'underline', color: '#000' }}>contact@bikko.studio</Link>.
              </p>
            </div>
          </article>
        </div>

        {/* 3. Footer */}
        <footer className="terms-footer">
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
