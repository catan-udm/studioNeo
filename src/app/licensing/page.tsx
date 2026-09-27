import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import './licensing.css';

export const metadata: Metadata = {
  title: 'Licensing & Rights • Digital Asset Specifications • bikko.studio',
  description:
    'Digital licensing specifications, personal collector rights, and commercial production clearances for studioNeo.',
  alternates: {
    canonical: 'https://bikko.studio/licensing',
  },
  openGraph: {
    title: 'Licensing & Rights • bikko.studio',
    description:
      'Digital licensing specifications, personal collector rights, and commercial production clearances for studioNeo.',
    url: 'https://bikko.studio/licensing',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Licensing & Rights • bikko.studio',
    description:
      'Digital licensing specifications, personal collector rights, and commercial production clearances for studioNeo.',
  },
};

const licensingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://bikko.studio/licensing/#webpage',
      url: 'https://bikko.studio/licensing',
      name: 'Licensing & Rights • bikko.studio',
      description:
        'Digital licensing specifications, personal collector rights, and commercial production clearances for studioNeo.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/licensing/#breadcrumb',
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
          name: 'Licensing & Rights',
          item: 'https://bikko.studio/licensing',
        },
      ],
    },
  ],
};

export default function LicensingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(licensingStructuredData) }}
      />
      <main id="main-content" className="licensing-page">
        {/* 1. Header */}
        <section className="licensing-header" aria-labelledby="licensing-heading">
          <span className="licensing-overline">LEGAL &amp; CURATORIAL FRAMEWORK</span>
          <h1 id="licensing-heading" className="licensing-title">
            Licensing &amp; Rights
          </h1>
          <p className="licensing-lead">
            Comprehensive rights specifications for collectors, creative agencies, and kinetic media installations across the studioNeo archive.
          </p>
        </section>

        {/* 2. License Tiers Overview */}
        <div className="licensing-container">
          <section className="license-card" aria-labelledby="tier-a-heading">
            <div className="license-badge">TIER A</div>
            <h2 id="tier-a-heading">Personal &amp; Collector Cel License</h2>
            <p className="license-summary">
              Granted automatically with any collector membership, unlocked cel acquisition, or physical edition print purchase.
            </p>
            <ul className="license-rights-list">
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Personal Display:</strong> High-resolution display on personal screens, holographic frames, and domestic environments.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Lossless Archiving:</strong> Storage and uncompressed backup of raw 4K cels and mathematical SVG vector stems.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Secondary Trading:</strong> Transfer of authenticated physical or cryptographic cel provenance to another collector.
                </div>
              </li>
              <li className="right-prohibited">
                <span className="right-cross" aria-hidden="true">✕</span>
                <div>
                  <strong>Commercial Resale:</strong> Reselling raw vector stems, mass manufacturing physical goods, or broadcasting without attribution.
                </div>
              </li>
            </ul>
          </section>

          <section className="license-card" aria-labelledby="tier-b-heading">
            <div className="license-badge">TIER B</div>
            <h2 id="tier-b-heading">Studio &amp; Commercial Production License</h2>
            <p className="license-summary">
              Available through the Studio Commercial membership or direct per-project licensing agreements.
            </p>
            <ul className="license-rights-list">
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Broadcast &amp; Interactive Media:</strong> Use in commercial motion broadcasts, game assets, interactive stages, and brand campaigns.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Vector Stem Integration:</strong> Importing, manipulating, and re-rendering SVG layers in commercial 2D/3D pipelines.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Worldwide Non-Exclusive:</strong> Perpetual, worldwide distribution across digital and streaming channels.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Multi-Seat Clearance:</strong> Internal agency and production crew usage up to 5 individual seats.
                </div>
              </li>
            </ul>
          </section>

          {/* Provenance & Cryptographic Signature */}
          <section className="provenance-section" aria-labelledby="provenance-heading">
            <h2 id="provenance-heading">Cryptographic Provenance &amp; Verification</h2>
            <p>
              Every archived cel across the studioNeo index is stamped with an immutable cryptographic ledger record containing its unique catalog code, generation timestamp, master artist identity, and mathematical SVG parameters.
            </p>
            <div className="provenance-grid">
              <div className="provenance-item">
                <span className="provenance-label">HASH PROTOCOL</span>
                <span className="provenance-val">SHA-256 STEM DIGEST</span>
              </div>
              <div className="provenance-item">
                <span className="provenance-label">SIGNING KEY</span>
                <span className="provenance-val">FIDO2 ED25519 ATTESTATION</span>
              </div>
              <div className="provenance-item">
                <span className="provenance-label">FORMAT STANDARD</span>
                <span className="provenance-val">W3C SCALABLE VECTOR GRAPHICS 2.0</span>
              </div>
            </div>
          </section>

          {/* Action Row */}
          <div className="licensing-actions">
            <Link href="/contact?topic=licensing" className="btn-pill-primary btn-pill-lg">
              Inquire for Custom Commercial Licensing
            </Link>
            <Link href="/gallery" className="btn-pill-secondary btn-pill-lg">
              Browse Archive Index
            </Link>
          </div>
        </div>

        {/* 3. Footer */}
        <footer className="licensing-footer">
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
