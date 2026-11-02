import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import StudioFooter from '../components/StudioFooter';
import './licensing.css';

export const metadata: Metadata = {
  title: 'Content Rights & Distribution Policy • studioNeo',
  description:
    "Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist.",
  alternates: {
    canonical: 'https://studioneo.tech/licensing',
  },
  openGraph: {
    title: 'Content Rights & Distribution Policy • studioNeo',
    description:
      "Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist.",
    url: 'https://studioneo.tech/licensing',
    type: 'website',
    locale: 'en_US',
    siteName: 'studioNeo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Rights & Distribution Policy • studioNeo',
    description:
      "Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist.",
  },
};

const licensingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://studioneo.tech/licensing/#webpage',
      url: 'https://studioneo.tech/licensing',
      name: 'Content Rights & Distribution Policy • studioNeo',
      description:
        'Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a Featured artist.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://studioneo.tech/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://studioneo.tech/licensing/#breadcrumb',
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
          name: 'Content Rights & Distribution Policy',
          item: 'https://studioneo.tech/licensing',
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
            Content Rights &amp; Distribution Policy
          </h1>
          <p className="licensing-lead">
            {"Each individual artist reserves the right on how their content is used. studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist."}
          </p>
        </section>

        {/* 2. Content Rights & Distribution Cards */}
        <div className="licensing-container">
          <section className="license-card" aria-labelledby="policy-1-heading">
            <div className="license-badge">POLICY 01</div>
            <h2 id="policy-1-heading">Individual Artist Sovereignty &amp; Rights Reservation</h2>
            <p className="license-summary">
              Each individual artist reserves the right on how their content is used across all media, formats, and derivatives.
            </p>
            <ul className="license-rights-list">
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Exclusive Creator Copyright:</strong> All artworks, characters, illustrations, and vector stems hosted or referenced on studioNeo remain the exclusive intellectual property and copyright of their respective individual creators.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Attribution &amp; Provenance:</strong> Every work exhibited in the archive credits the original creator and links directly to their verified official portfolios.
                </div>
              </li>
              <li className="right-prohibited">
                <span className="right-cross" aria-hidden="true">✕</span>
                <div>
                  <strong>No Third-Party Licensing by Platform:</strong> studioNeo does not sell, license, or convey distribution rights to any third party.
                </div>
              </li>
            </ul>
          </section>

          <section className="license-card" aria-labelledby="policy-2-heading">
            <div className="license-badge">POLICY 02</div>
            <h2 id="policy-2-heading">Distribution Restrictions &amp; &ldquo;Featured&rdquo; Artist Criteria</h2>
            <p className="license-summary">
              {"studioNeo does not have the right to distribute illustrator works unless specified as a 'Featured' artist."}
            </p>
            <ul className="license-rights-list">
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Featured Artist Authorization:</strong> Distribution and master stem downloads are strictly restricted and only permitted for designated <strong>&ldquo;Featured&rdquo;</strong> artist projects with formal creator authorization.
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Curatorial Study &amp; Referral:</strong> Non-featured works are exhibited solely for non-commercial curatorial study, appreciation, and direct traffic referral to verified artist profiles.
                </div>
              </li>
              <li className="right-prohibited">
                <span className="right-cross" aria-hidden="true">✕</span>
                <div>
                  <strong>No Paid Access Tiers:</strong> studioNeo does not sell paid access tiers or commercial distribution licenses for illustrator works.
                </div>
              </li>
            </ul>
          </section>

          <section className="license-card" aria-labelledby="policy-3-heading" style={{ gridColumn: '1 / -1' }}>
            <div className="license-badge">POLICY 03</div>
            <h2 id="policy-3-heading">Commercial Clearance &amp; Direct Artist Channels</h2>
            <p className="license-summary">
              All commercial inquiries, commission requests, and usage clearances are handled directly by the respective illustrator.
            </p>
            <ul className="license-rights-list">
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Direct Creator Clearance:</strong> Inquiries for commercial licensing, advertising, publishing, or commissions must be cleared directly with the individual artist via their verified channels (Pixiv, Twitter/X, Booth, or official agency desk).
                </div>
              </li>
              <li>
                <span className="right-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Artist Takedown &amp; Curation Control:</strong> Creators may request immediate updates, attribution changes, or removal of any curatorial entry at any time via our rights desk.
                </div>
              </li>
            </ul>
          </section>

          {/* Provenance & Cryptographic Signature */}
          <section className="provenance-section" aria-labelledby="provenance-heading">
            <h2 id="provenance-heading">Cryptographic Provenance &amp; Verification</h2>
            <p>
              Every archived cel across the studioNeo index is stamped with an immutable cryptographic ledger record containing its unique catalog code, generation timestamp, master artist attribution, and mathematical SVG parameters.
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
              Contact Artist Rights &amp; Curation Desk
            </Link>
            <Link href="/artist" className="btn-pill-secondary btn-pill-lg">
              Browse Verified Artist Directory
            </Link>
          </div>
        </div>

        {/* 3. Footer */}
        <StudioFooter className="licensing-footer" />
      </main>
    </>
  );
}
