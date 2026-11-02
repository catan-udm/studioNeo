'use client';

import React from 'react';
import Link from 'next/link';
import PaletteArtwork from './PaletteArtwork';
import BikkoMark from '@/app/components/BikkoMark';
import { illustrators } from '@/data/illustrators';
import '@/app/about/about.css';
import '@/app/landing.css';

export function ArrowIcon({ size = 19 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

export default function StudioLanding() {
  return (
    <main id="main-content" className="studio-landing-root">
      {/* Hero Section with Interactive Palette Grid Artwork */}
      <div className="landing-page">
        <section className="landing-hero" aria-labelledby="landing-title">
          <PaletteArtwork />
          <div className="landing-content">
            <div className="landing-copy">
              <h1 id="landing-title">bikko.studio</h1>
              <p>Go ahead and say just a little more about what you do.</p>
            </div>
            <div className="landing-actions" role="group" aria-label="Primary landing actions">
              <Link className="landing-button landing-button-primary" href="/artist">
                Explore the artists
              </Link>
              <Link className="landing-button landing-button-secondary" href="/projects">
                Projects
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Atelier About & Philosophy Section */}
      <section className="about-page" style={{ minHeight: 'auto', padding: '6rem 1.5rem 6rem' }}>
        <div className="about-minimal-container">
          {/* Insignia Mark */}
          <div className="about-mark-wrap" aria-hidden="true">
            <BikkoMark width={64} height={56} color="currentColor" />
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
            <Link href="/artist" className="about-pill-btn about-pill-primary">
              Explore Artist Directory
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
        </div>
      </section>

      {/* Beyond the Grid */}
      <section className="studio-next" aria-labelledby="studio-next-title">
        <div className="studio-next-copy">
          <span className="eyebrow">Beyond the grid</span>
          <h2 id="studio-next-title">The people are the picture.</h2>
          <p>
            Explore our visual projects, or open the complete directory to discover all {illustrators.length} illustrators.
          </p>
        </div>
        <div className="studio-next-links">
          <Link className="text-link" href="/projects">
            Explore projects <ArrowIcon size={16} />
          </Link>
          <Link className="text-link" href="/artist">
            Explore the {illustrators.length}-artist directory <ArrowIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <Link className="site-footer-brand" href="/">
          bikko.studio
        </Link>
        <span>{illustrators.length} illustrators · official profile links</span>
        <nav aria-label="Footer navigation">
          <Link href="/">Studio</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/artist">Artists</Link>
        </nav>
      </footer>
    </main>
  );
}
