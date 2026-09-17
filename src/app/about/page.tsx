import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import BikkoMark from '../components/BikkoMark';
import './about.css';

export const metadata: Metadata = {
  title: 'About • bikko.studio',
  description: 'Learn about Bikko Studio, our creative philosophy, generative kinetics, WebAuthn architecture, and visual engineering.',
};

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* 1. Hero Section */}
      <section className="about-hero">
        <span className="about-hero-badge">About Bikko Studio &bull; Est. 2026</span>
        <h1>Bridging Creative Code, Kinetic Motion &amp; Next-Gen Identity.</h1>
        <p className="about-hero-lead">
          Bikko Studio is an experimental digital atelier crafting algorithmically driven motion art,
          frictionless WebAuthn authentication, and bespoke interactive web experiences with minimalist precision.
        </p>

        {/* Stats Row */}
        <div className="about-stats-row">
          <div className="about-stat-card">
            <span className="about-stat-number">10+</span>
            <span className="about-stat-label">Kinetic Artworks</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-number">100%</span>
            <span className="about-stat-label">Passkey Native</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-number">0ms</span>
            <span className="about-stat-label">LCP Vector Latency</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-number">15min</span>
            <span className="about-stat-label">Expiring Asset SAS</span>
          </div>
        </div>
      </section>

      {/* Main Content Sections Container */}
      <div className="about-container">
        {/* 2. Philosophy & Core Pillars */}
        <section>
          <div className="about-section-header">
            <h2>Our Core Pillars</h2>
            <p>
              We believe software should feel tactile, fast, and respectful of user privacy.
              Every interaction is engineered around three fundamental tenets.
            </p>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3>Precision Fluid Motion</h3>
              <p>
                From water-droplet detached navigation bars to spring-physics transitions, every motion cue reflects real-world fluidity rather than canned linear animations.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Zero-Password Identity</h3>
              <p>
                Passwords belong in the past. We integrate hardware FIDO2 keys, Touch ID, Windows Hello, and time-restricted verification codes directly into the browser core.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Cryptographic Security</h3>
              <p>
                Subscriber perk assets and downloads are secured with rotating Azure Blob Shared Access Signatures, ensuring authorized access without perpetual exposure.
              </p>
            </div>
          </div>
        </section>

        {/* 3. The Origin & Story Narrative */}
        <section className="about-story-split">
          <div className="about-story-text">
            <h2>Crafted with Intent, Not Templates</h2>
            <p>
              Bikko Studio originated from a desire to escape the monotony of homogeneous component libraries and heavy JavaScript frameworks. We set out to prove that native Web APIs, clean semantic HTML5, and curated CSS variables could deliver superior fidelity with a fraction of the overhead.
            </p>
            <div className="about-story-quote">
              &ldquo;Design is not just what it looks like and feels like. Design is how it functions, how it reacts to your scroll, and how securely it protects your identity.&rdquo;
            </div>
            <p>
              By replacing raster PNG graphics with vectorized mathematical SVG curves, we eliminated Largest Contentful Paint (LCP) bottlenecks entirely. The studio mark renders inline in the initial byte stream, crisp at any scale from mobile screens to 4K displays.
            </p>
          </div>

          <div className="about-story-graphic">
            <div className="about-story-mark">
              <BikkoMark width="100%" height="100%" />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>The Bikko Insignia</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mathematical vector topology &bull; Infinite resolution &bull; 0 raster pixels
              </p>
            </div>
          </div>
        </section>

        {/* 4. Engineering & Architecture */}
        <section>
          <div className="about-section-header">
            <h2>Engineered for Performance</h2>
            <p>
              Modern standards, lightning-fast compilation, and strict architectural discipline.
            </p>
          </div>

          <div className="about-tech-grid">
            <div className="about-tech-item">
              <span className="about-tech-name">Next.js 16 (Turbopack)</span>
              <p className="about-tech-desc">Instant HMR builds and server-rendered edge speed without client hydration waterfalls.</p>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-name">React 19 Core</span>
              <p className="about-tech-desc">Concurrent rendering primitives and declarative suspense boundaries.</p>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-name">WebAuthn &amp; SimpleWebAuthn</span>
              <p className="about-tech-desc">Hardware-backed biometric passkeys registered directly to your device authenticator.</p>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-name">Native CSS Design System</span>
              <p className="about-tech-desc">Granular modular stylesheets with zero runtime CSS-in-JS performance penalties.</p>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-name">Azure Communication &amp; Storage</span>
              <p className="about-tech-desc">Cryptographically signed SAS URLs and instant transaction delivery.</p>
            </div>
            <div className="about-tech-item">
              <span className="about-tech-name">Drizzle ORM &amp; MySQL</span>
              <p className="about-tech-desc">Type-safe database schemas with zero-overhead relational queries.</p>
            </div>
          </div>
        </section>

        {/* 5. Studio Roadmap & Milestones */}
        <section>
          <div className="about-section-header">
            <h2>Studio Milestones &amp; Roadmap</h2>
            <p>Track our progression as we expand the studio's digital frontiers.</p>
          </div>

          <div className="about-timeline">
            <div className="about-timeline-item completed">
              <div className="about-timeline-dot">&check;</div>
              <div className="about-timeline-content">
                <h4>Phase 1 &bull; Core Infrastructure &amp; Passwordless Auth</h4>
                <p>Launched WebAuthn passkey registration, biometric login, OTP fallbacks, and vectorized brand identities.</p>
              </div>
            </div>

            <div className="about-timeline-item completed">
              <div className="about-timeline-dot">&check;</div>
              <div className="about-timeline-content">
                <h4>Phase 2 &bull; Modular CSS Granularization &amp; LCP Zeroing</h4>
                <p>Extracted page-scoped stylesheets (`landing.css`, `auth.css`, `dashboard.css`, `about.css`) and streamlined `globals.css`.</p>
              </div>
            </div>

            <div className="about-timeline-item active">
              <div className="about-timeline-dot">&bull;</div>
              <div className="about-timeline-content">
                <h4>Phase 3 &bull; Dynamic Island &amp; Water Droplet Navigation</h4>
                <p>Implemented scroll-driven physics where navigation detaches like a fluid droplet into a floating island dock.</p>
              </div>
            </div>

            <div className="about-timeline-item">
              <div className="about-timeline-dot">4</div>
              <div className="about-timeline-content">
                <h4>Phase 4 &bull; WebGPU Shader Canvas &amp; Kinetic 3D</h4>
                <p>Next-generation hardware-accelerated interactive canvas shaders and gyro-tilt reactive art tiles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Frequently Asked Questions */}
        <section>
          <div className="about-section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about navigating and subscribing to Bikko Studio.</p>
          </div>

          <div className="about-faq-grid">
            <div className="about-faq-card">
              <h4>What is a WebAuthn Passkey?</h4>
              <p>
                A passkey is a digital credential tied to your biometric sensor (like Touch ID or Windows Hello) or a hardware security key. It replaces passwords entirely, cannot be phished, and never leaks credentials.
              </p>
            </div>

            <div className="about-faq-card">
              <h4>How does the floating navigation work?</h4>
              <p>
                When scrolling past the top threshold, an event-free requestAnimationFrame listener detects the scroll offset and activates the water droplet keyframe animation, detaching the controls into an elevated frosted pill dock.
              </p>
            </div>

            <div className="about-faq-card">
              <h4>What perks do subscribers receive?</h4>
              <p>
                Verified subscribers unlock exclusive digital media assets, high-resolution vector artwork files, and time-expiring direct download URLs generated cryptographically.
              </p>
            </div>

            <div className="about-faq-card">
              <h4>Does Bikko Studio track personal data?</h4>
              <p>
                No third-party analytics, no tracking pixels, and no ad network cookies. We only store essential authentication records and passkey public key credentials needed for secure login.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Call to Action Banner */}
        <section className="about-cta-banner">
          <h2>Ready to experience the studio?</h2>
          <p>
            Join as a verified subscriber, register your device passkey in seconds, and explore our collection of interactive kinetic artworks.
          </p>
          <div className="about-cta-actions">
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
              Create Account
            </Link>
            <Link href="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              Sign In
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
              &larr; View Studio Works
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
