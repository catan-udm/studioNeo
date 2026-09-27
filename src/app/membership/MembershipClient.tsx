'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import './membership.css';

interface PlanPricing {
  monthly: string;
  annual: string;
  annualPerMonth: string;
}

const PRICING: Record<'free' | 'collector' | 'studio', PlanPricing> = {
  free: {
    monthly: '$0',
    annual: '$0',
    annualPerMonth: '$0',
  },
  collector: {
    monthly: '$12',
    annual: '$120',
    annualPerMonth: '$10',
  },
  studio: {
    monthly: '$49',
    annual: '$480',
    annualPerMonth: '$40',
  },
};

const FAQS = [
  {
    q: 'Can I cancel my membership at any time?',
    a: 'Yes, absolutely. You can cancel your subscription with a single click inside your subscriber dashboard. You will retain full archive and download access until the end of your current billing cycle.',
  },
  {
    q: 'What formats are included with vector stems?',
    a: 'Collector and Studio members receive lossless SVG source files, raw mathematically defined vector layers, and uncompressed 4K master visual cels suitable for high-resolution print and real-time kinetic composition.',
  },
  {
    q: 'How does passwordless passkey login work?',
    a: 'studioNeo leverages the WebAuthn standard with hardware-backed FIDO2 cryptographic credentials. You can sign in instantly using Touch ID, Face ID, Windows Hello, or hardware security keys without entering or memorizing passwords.',
  },
  {
    q: 'What rights are included in the Studio Commercial tier?',
    a: 'The Studio Commercial plan includes full commercial display and reproduction rights for client broadcasts, interactive web installations, brand identity applications, and multi-seat designer teams.',
  },
];

export default function MembershipClient() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <main id="main-content" className="membership-page">
      {/* 1. Hero Header */}
      <section className="membership-hero">
        <span className="membership-overline">SUBSCRIPTION TIERS &amp; ARCHIVE ACCESS</span>
        <h1 className="membership-title">
          Membership Tiers
        </h1>
        <p className="membership-lead">
          Direct access to 128 losslessly preserved vector cels, subscriber-only vaults,
          SVG source stems, and hardware-backed biometric identity.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="billing-switcher-wrap" role="group" aria-label="Billing cycle selector">
          <div className="billing-switcher">
            <button
              type="button"
              className={`switcher-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              className={`switcher-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual (Save 20%)
              <span className="discount-pill">2 MONTHS FREE</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Pricing Tiers Grid */}
      <section className="membership-tiers-grid" aria-label="Membership plans">
        {/* Tier 1: Public Guest */}
        <article className="tier-card tier-free">
          <div className="tier-card-header">
            <span className="tier-badge-label">GUEST INDEX</span>
            <h2 className="tier-name">Public Preview</h2>
            <p className="tier-desc">Casual browsing of public studio cels and resident artists.</p>
          </div>

          <div className="tier-pricing-row">
            <span className="tier-price-amount">$0</span>
            <span className="sr-only"> USD</span>
            <span className="tier-price-period">/ forever</span>
          </div>

          <div className="tier-perks-list">
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>8 Unlocked public stream items</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Standard compressed web cel resolution</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Access to resident artist profiles</span>
            </div>
            <div className="tier-perk-item perk-disabled">
              <span className="perk-cross">✕</span>
              <span>Subscriber Vault access</span>
            </div>
            <div className="tier-perk-item perk-disabled">
              <span className="perk-cross">✕</span>
              <span>Lossless 4K &amp; SVG Stem downloads</span>
            </div>
          </div>

          <div className="tier-action-wrap">
            <Link href="/gallery" className="btn-pill-secondary tier-cta-btn">
              Explore Public Gallery
            </Link>
          </div>
        </article>

        {/* Tier 2: Collector (Featured / Most Popular) */}
        <article className="tier-card tier-featured">
          <div className="featured-ribbon">MOST POPULAR</div>

          <div className="tier-card-header">
            <span className="tier-badge-label">COLLECTOR ACCESS</span>
            <h2 className="tier-name">Archive Member</h2>
            <p className="tier-desc">Full 128-work archive, vector stems, and private vaults.</p>
          </div>

          <div className="tier-pricing-row">
            <span className="tier-price-amount">
              {billingCycle === 'monthly' ? PRICING.collector.monthly : PRICING.collector.annualPerMonth}
            </span>
            <span className="sr-only"> USD</span>
            <span className="tier-price-period">
              / month {billingCycle === 'annual' && `(billed $120/yr)`}
            </span>
          </div>

          <div className="tier-perks-list">
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span><strong>All 128 Archived Works</strong> unlocked</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span><strong>All 11 Private Subscriber Vaults</strong></span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Lossless 4K &amp; raw SVG stem downloads</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Passwordless Biometric Passkeys (FIDO2)</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>48-Hour Priority presale on physical acrylic cels</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Direct support to studio resident artists</span>
            </div>
          </div>

          <div className="tier-action-wrap">
            <Link href="/register" className="btn-pill-primary tier-cta-btn">
              Start Collector Membership
            </Link>
          </div>
        </article>

        {/* Tier 3: Studio Commercial Lab */}
        <article className="tier-card tier-studio">
          <div className="tier-card-header">
            <span className="tier-badge-label">ENTERPRISE LAB</span>
            <h2 className="tier-name">Studio Commercial</h2>
            <p className="tier-desc">Commercial reproduction licenses and high-throughput pipelines.</p>
          </div>

          <div className="tier-pricing-row">
            <span className="tier-price-amount">
              {billingCycle === 'monthly' ? PRICING.studio.monthly : PRICING.studio.annualPerMonth}
            </span>
            <span className="sr-only"> USD</span>
            <span className="tier-price-period">
              / month {billingCycle === 'annual' && `(billed $480/yr)`}
            </span>
          </div>

          <div className="tier-perks-list">
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Everything in Archive Member</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span><strong>Full Commercial Reproduction License</strong></span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Unlimited SVG stem exports for commercial projects</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Multi-seat studio licensing (up to 5 team seats)</span>
            </div>
            <div className="tier-perk-item">
              <span className="perk-check">✓</span>
              <span>Direct Resident Artist commission channel</span>
            </div>
          </div>

          <div className="tier-action-wrap">
            <Link href="/contact?topic=commercial" className="btn-pill-secondary tier-cta-btn">
              Contact Studio Lab
            </Link>
          </div>
        </article>
      </section>

      {/* 3. Detailed Features Comparison Table */}
      <section className="membership-matrix-section">
        <h2 className="matrix-title">Feature Comparison</h2>
        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <caption className="sr-only">Membership Tiers Feature Comparison Matrix</caption>
            <thead>
              <tr>
                <th className="th-feature">Feature</th>
                <th className="th-plan">Guest</th>
                <th className="th-plan featured-th">Collector ($12/mo)</th>
                <th className="th-plan">Studio ($49/mo)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Archived Works Access</td>
                <td>8 Public items</td>
                <td>All 128 Works</td>
                <td>All 128 Works + Raw Cels</td>
              </tr>
              <tr>
                <td>Subscriber Vaults</td>
                <td>Locked (Preview only)</td>
                <td>Full Access (11 Vaults)</td>
                <td>Full Access + Source Cels</td>
              </tr>
              <tr>
                <td>Vector SVG Stems</td>
                <td>—</td>
                <td>Lossless Download</td>
                <td>Unlimited Commercial Stems</td>
              </tr>
              <tr>
                <td>Passkey Authentication</td>
                <td>—</td>
                <td>Touch ID / FIDO2 Sync</td>
                <td>Touch ID / FIDO2 Sync</td>
              </tr>
              <tr>
                <td>Commercial Usage Rights</td>
                <td>Personal only</td>
                <td>Personal &amp; Display</td>
                <td>Worldwide Commercial License</td>
              </tr>
              <tr>
                <td>Physical Cel Presales</td>
                <td>—</td>
                <td>48-Hour Priority</td>
                <td>Guaranteed Allocation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Frequently Asked Questions Accordion */}
      <section className="membership-faq-section">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={faq.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className="faq-arrow">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer-block">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer className="membership-footer">
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
  );
}
