import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import BikkoMark from '../components/BikkoMark';
import './about.css';

export const metadata: Metadata = {
  title: 'About • Curatorial Statement & Philosophy • bikko.studio',
  description:
    'Minimalist creative code atelier crafting algorithmic kinetic motion art, lossless SVG vector stems, and biometric WebAuthn passkey identity.',
  alternates: {
    canonical: 'https://bikko.studio/about',
  },
  openGraph: {
    title: 'About • bikko.studio Atelier',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art and passwordless identity.',
    url: 'https://bikko.studio/about',
    type: 'website',
    locale: 'en_US',
    siteName: 'bikko.studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About • bikko.studio Atelier',
    description:
      'Minimalist creative code atelier crafting algorithmic kinetic motion art and passwordless identity.',
  },
};

const aboutStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://bikko.studio/about/#webpage',
      url: 'https://bikko.studio/about',
      name: 'About • bikko.studio',
      description:
        'Minimalist creative code atelier crafting algorithmic kinetic motion art and passwordless identity.',
      inLanguage: 'en-US',
      isPartOf: {
        '@id': 'https://bikko.studio/#website',
      },
      about: {
        '@id': 'https://bikko.studio/#organization',
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://bikko.studio/about/#breadcrumb',
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
          name: 'About',
          item: 'https://bikko.studio/about',
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutStructuredData) }}
      />
      <main id="main-content" className="about-page">
        <div className="about-minimal-container">
          {/* Insignia Mark */}
          <div className="about-mark-wrap" aria-hidden="true">
            <BikkoMark width={64} height={56} color="#000000" />
          </div>

          {/* Header Block (Center-Aligned) */}
          <header className="about-header">
            <span className="about-overline">
              bikko.studio &bull; Est. <time dateTime="2026">2026</time>
            </span>
            <h1 className="about-title">
              Creative Code, Kinetic Motion &amp; Next-Gen Identity.
            </h1>
            <p className="about-lead">
              An experimental atelier engineering algorithmically driven visual cels,
              frictionless WebAuthn passkeys, and high-contrast digital artifacts.
            </p>
          </header>

          {/* 3 Core Tenets (Minimalist Editorial Layout) */}
          <section className="about-tenets" aria-label="Core studio tenets">
            <div className="tenet-row">
              <span className="tenet-index">01</span>
              <div className="tenet-content">
                <h2>Kinetic Motion</h2>
                <p>
                  From fluid liquid droplet navigation to spring-physics transitions, every motion cue reflects real-world fluidity and algorithmic precision.
                </p>
              </div>
            </div>

            <div className="tenet-row">
              <span className="tenet-index">02</span>
              <div className="tenet-content">
                <h2>Zero Passwords</h2>
                <p>
                  Eliminating legacy authentication in favor of hardware-backed FIDO2 keys, Touch ID, Windows Hello, and biometric passkeys directly embedded in the browser core.
                </p>
              </div>
            </div>

            <div className="tenet-row">
              <span className="tenet-index">03</span>
              <div className="tenet-content">
                <h2>Vector Topology</h2>
                <p>
                  Zero raster latency. Every visual frame and Insignia glyph renders inline via mathematical SVG curves, razor-sharp on any display from mobile to 4K.
                </p>
              </div>
            </div>
          </section>

          {/* Minimal Action Pill Buttons */}
          <nav className="about-actions" aria-label="Explore Atelier">
            <Link href="/gallery" className="about-pill-btn about-pill-primary">
              Explore Gallery Archive
            </Link>
            <Link href="/projects" className="about-pill-btn about-pill-secondary">
              View Projects
            </Link>
            <Link href="/membership" className="about-pill-btn about-pill-secondary">
              Membership Tiers
            </Link>
            <Link href="/contact" className="about-pill-btn about-pill-secondary">
              Contact Studio
            </Link>
          </nav>

          {/* Minimalist Studio Footer */}
          <footer className="about-footer">
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
        </div>
      </main>
    </>
  );
}
