'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import './contact.css';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState<string>('commission');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync topic with query param if present
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      if (topicParam === 'commercial') {
        setTopic('licensing');
      } else if (['commission', 'licensing', 'print', 'artist', 'general'].includes(topicParam)) {
        setTopic(topicParam);
      }
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate direct studio dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <main className="contact-page">
      {/* 1. Header */}
      <section className="contact-header">
        <span className="contact-overline">STUDIO COMMISSIONS &amp; INQUIRIES</span>
        <h1 className="contact-title">Contact Studio</h1>
        <p className="contact-lead">
          Connect with the studioNeo curation desk for bespoke kinetic cels, commercial broadcast rights, and physical exhibition print acquisitions.
        </p>
      </section>

      {/* 2. Main Contact Grid */}
      <section className="contact-container">
        <div className="contact-form-col">
          {submitted ? (
            <div className="contact-success-card">
              <div className="success-icon">✓</div>
              <h2>Inquiry Dispatched</h2>
              <p>
                Thank you, <strong>{name}</strong>. Your inquiry regarding <strong>{topic}</strong> has been transmitted to our curatorial desk. A studio director will respond within 24 hours.
              </p>
              <button
                type="button"
                className="btn-pill-primary"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                  setOrganization('');
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="topic-select" className="form-label">
                  INQUIRY SUBJECT
                </label>
                <div className="topic-chips-row">
                  {[
                    { id: 'commission', label: 'Bespoke Commission' },
                    { id: 'licensing', label: 'Commercial Licensing' },
                    { id: 'print', label: 'Physical Print Acquisition' },
                    { id: 'artist', label: 'Artist Residency' },
                    { id: 'general', label: 'General Press' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`topic-chip ${topic === item.id ? 'active' : ''}`}
                      onClick={() => setTopic(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="name-input" className="form-label">
                    YOUR NAME *
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adrian or Studio Name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email-input" className="form-label">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adrian@example.com"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="org-input" className="form-label">
                  ORGANIZATION / STUDIO (OPTIONAL)
                </label>
                <input
                  id="org-input"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Creative Agency, Production Co., or Independent"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message-input" className="form-label">
                  PROJECT SPECIFICATIONS &amp; TIMELINE *
                </label>
                <textarea
                  id="message-input"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your project, required deliverables, timeline, or cel codes of interest..."
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill-primary btn-pill-lg contact-submit-btn"
              >
                {isSubmitting ? 'Transmitting to Curatorial Desk...' : 'Transmit Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Studio Info Sidebar */}
        <div className="contact-info-col">
          <div className="info-card">
            <h3>Direct Atelier Channels</h3>
            <div className="info-item">
              <span className="info-label">CURATORIAL DESK</span>
              <span className="info-val">curator@bikko.studio</span>
            </div>
            <div className="info-item">
              <span className="info-label">LICENSING &amp; RIGHTS</span>
              <span className="info-val">rights@bikko.studio</span>
            </div>
            <div className="info-item">
              <span className="info-label">RESIDENT ARTISTS DISPATCH</span>
              <span className="info-val">artists@bikko.studio</span>
            </div>
            <div className="info-item">
              <span className="info-label">STUDIO HEADQUARTERS</span>
              <span className="info-val">Shibuya, Tokyo &bull; Distributed Atelier</span>
            </div>
          </div>

          <div className="info-card">
            <h3>Service Level Agreement</h3>
            <p className="info-text">
              Direct inquiries receive initial curatorial review and response within 24 hours. Emergency commercial broadcast clearance requests are handled with 4-hour priority dispatch.
            </p>
          </div>

          <div className="info-card">
            <h3>Quick Links</h3>
            <div className="quick-links-list">
              <Link href="/gallery" className="quick-link-item">
                <span>Explore Full 128-Work Archive</span>
                <span>↗</span>
              </Link>
              <Link href="/collection" className="quick-link-item">
                <span>Saved Archive Collection</span>
                <span>↗</span>
              </Link>
              <Link href="/membership" className="quick-link-item">
                <span>View Membership &amp; Vault Access Tiers</span>
                <span>↗</span>
              </Link>
              <Link href="/licensing" className="quick-link-item">
                <span>Review Commercial Licensing Terms</span>
                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Footer */}
      <footer className="contact-footer">
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
          <span>&copy; 2026 studioNeo Archive. All curation rights preserved.</span>
          <span>bikko.studio visual engineering</span>
        </div>
      </footer>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<main className="contact-page" />}>
      <ContactFormContent />
    </Suspense>
  );
}
