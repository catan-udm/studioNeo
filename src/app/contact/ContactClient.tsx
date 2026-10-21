'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAuthenticatedSession, invalidateAuthCache } from '@/lib/clientAuthCache';
import './contact.css';

function ContactFormContent() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState<string>('commission');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [artistHandle, setArtistHandle] = useState('');
  const [discipline, setDiscipline] = useState('Generative Vectors');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Spam defences: honeypot (must stay empty) and form-render timestamp
  const [website, setWebsite] = useState('');
  const formStartedAtRef = useRef<number>(0);
  useEffect(() => {
    formStartedAtRef.current = Date.now();
  }, []);

  // Curatorial Role Ceremony State
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [ceremonyTargetEmail, setCeremonyTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('artist_resident');
  const [isCeremonyLoading, setIsCeremonyLoading] = useState(false);
  const [ceremonySuccessMsg, setCeremonySuccessMsg] = useState<string | null>(null);
  const [ceremonyErrorMsg, setCeremonyErrorMsg] = useState<string | null>(null);
  const [isCeremonyDrawerOpen, setIsCeremonyDrawerOpen] = useState(false);

  // Sync session
  useEffect(() => {
    getAuthenticatedSession().then((res) => {
      if (res.authenticated && res.subscriber) {
        setSessionEmail(res.subscriber.email);
        setCurrentTier(res.subscriber.tier || 'free');
        setCeremonyTargetEmail(res.subscriber.email);
        if (!email) setEmail(res.subscriber.email);
      }
    }).catch(() => {});
  }, [email]);

  // Sync topic with query param if present
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (!topicParam) return;
    const timer = setTimeout(() => {
      if (topicParam === 'commercial') {
        setTopic('licensing');
      } else if (topicParam === 'artist_application' || topicParam === 'artist') {
        setTopic('artist_application');
        setIsCeremonyDrawerOpen(true);
      } else if (['commission', 'licensing', 'print', 'general'].includes(topicParam)) {
        setTopic(topicParam);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const composedMessage =
      topic === 'artist_application'
        ? `[Resident Artist Portfolio Application]\nPortfolio: ${portfolioUrl || 'N/A'}\nProposed Handle: @${artistHandle || 'N/A'}\nDiscipline: ${discipline}\n\nStatement:\n${message}`
        : message;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          organization: organization || (artistHandle ? `@${artistHandle}` : null),
          topic,
          message: composedMessage,
          website,
          startedAt: formStartedAtRef.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch inquiry to studio desk.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send inquiry.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteCeremony = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCeremonyLoading(true);
    setCeremonySuccessMsg(null);
    setCeremonyErrorMsg(null);

    const target = ceremonyTargetEmail.trim() || sessionEmail;
    if (!target) {
      setCeremonyErrorMsg('Please provide a target subscriber email address.');
      setIsCeremonyLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/curator/toggle-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: target,
          tier: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to execute curatorial role toggle.');
      }

      invalidateAuthCache();
      setCurrentTier(selectedRole);
      setCeremonySuccessMsg(
        `✓ Curatorial ceremony completed: ${target} is now granted ${selectedRole.toUpperCase()} credentials!`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Curatorial role update failed.';
      setCeremonyErrorMsg(msg);
    } finally {
      setIsCeremonyLoading(false);
    }
  };

  return (
    <main id="main-content" className="contact-page">
      {/* 1. Header */}
      <section className="contact-header" aria-labelledby="contact-heading">
        <span className="contact-overline">STUDIO COMMISSIONS &amp; CURATION DESK</span>
        <h1 id="contact-heading" className="contact-title">Contact Studio</h1>
        <p className="contact-lead">
          Connect with the studioNeo curation desk for resident artist applications, bespoke kinetic cels, commercial broadcast rights, and physical exhibition prints.
        </p>
      </section>

      {/* 2. Main Contact Grid */}
      <div className="contact-container">
        <div className="contact-form-col">
          {submitted ? (
            <div className="contact-success-card" role="alert">
              <div className="success-icon" aria-hidden="true">✓</div>
              <h2>
                {topic === 'artist_application'
                  ? 'Resident Artist Portfolio Transmitted'
                  : 'Inquiry Dispatched'}
              </h2>
              <p>
                Thank you, <strong>{name}</strong>. Your {topic === 'artist_application' ? 'resident artist application and portfolio dossier' : 'inquiry regarding ' + topic} has been transmitted directly to our curatorial desk. A studio director will review your materials and contact you within 24 hours.
              </p>
              {topic === 'artist_application' && (
                <div className="curator-ceremony-banner" style={{ margin: '1.5rem 0', padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>✦</span>
                    <strong style={{ fontSize: '0.95rem' }}>Curatorial Fast-Track Verification</strong>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                    Need immediate access to test the Creator Cel Upload &amp; Minting Studio? Toggle your credentials below using our curatorial ceremony desk.
                  </p>
                  <button
                    type="button"
                    className="btn-pill-primary btn-pill-sm"
                    onClick={() => {
                      setSubmitted(false);
                      setIsCeremonyDrawerOpen(true);
                    }}
                  >
                    Open Curatorial Ceremony Desk
                  </button>
                </div>
              )}
              <button
                type="button"
                className="btn-pill-secondary"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setMessage('');
                  setOrganization('');
                  setPortfolioUrl('');
                  setArtistHandle('');
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate={false}>
              {/* Honeypot: hidden from humans and assistive tech; bots tend to fill it */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label htmlFor="website-input">Leave this field empty</label>
                <input
                  id="website-input"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              {submitError && (
                <div
                  className="alert alert-error"
                  role="alert"
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#ef4444',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Inquiry Topic Selection */}
              <div className="form-group">
                <div id="topic-selector-label" className="form-label">
                  INQUIRY SUBJECT
                </div>
                <div
                  className="topic-chips-row"
                  role="radiogroup"
                  aria-labelledby="topic-selector-label"
                >
                  {[
                    { id: 'commission', label: 'Bespoke Commission' },
                    { id: 'licensing', label: 'Commercial Licensing' },
                    { id: 'artist_application', label: 'Resident Artist Portfolio Application' },
                    { id: 'print', label: 'Physical Print Acquisition' },
                    { id: 'general', label: 'General Press' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={topic === item.id}
                      className={`topic-chip ${topic === item.id ? 'active' : ''}`}
                      onClick={() => setTopic(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {topic === 'artist_application' && (
                <div className="artist-application-highlight-box" style={{ padding: '1rem 1.25rem', borderRadius: '16px', background: 'rgba(196, 150, 255, 0.08)', border: '1px solid rgba(196, 150, 255, 0.25)', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }}>✦</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Resident Artist &amp; Illustrator Intake Ceremony</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Submitting this dossier initiates curatorial evaluation for resident studio tags (<code style={{ fontSize: '0.8rem' }}>artist_resident</code>, <code style={{ fontSize: '0.8rem' }}>illustrator_pro</code>), unlocking access to our Creator Studio at <Link href="/studio/upload" style={{ color: 'var(--brand-primary)' }}>/studio/upload</Link> and a dedicated <Link href="/artist/neo_tokyo" style={{ color: 'var(--brand-primary)' }}>/artist/[handle]</Link> portfolio.
                  </p>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="name-input" className="form-label">
                    YOUR NAME *
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Artist Name"
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
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abcde@studioneo.tech"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Specialized fields for Artist Application */}
              {topic === 'artist_application' ? (
                <>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="portfolio-url-input" className="form-label">
                        PORTFOLIO / REEL / GITHUB URL *
                      </label>
                      <input
                        id="portfolio-url-input"
                        type="url"
                        required
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://portfolio.studio or GitHub"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="handle-input" className="form-label">
                        PROPOSED ARTIST HANDLE *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ padding: '0.75rem 0.5rem 0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRight: 'none', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>@</span>
                        <input
                          id="handle-input"
                          type="text"
                          required
                          value={artistHandle}
                          onChange={(e) => setArtistHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="tokyo_vectors"
                          className="form-input"
                          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="discipline-select" className="form-label">
                      PRIMARY DISCIPLINE &amp; MEDIUM *
                    </label>
                    <select
                      id="discipline-select"
                      value={discipline}
                      onChange={(e) => setDiscipline(e.target.value)}
                      className="form-input"
                    >
                      <option value="Generative Vectors">Generative Vectors &amp; Algorithmic Splines</option>
                      <option value="Kinetic Motion Studies">Kinetic Motion Studies &amp; Animated Cels</option>
                      <option value="Vector Illustration">Vector Illustration &amp; Precision Icons</option>
                      <option value="Monochrome Topography">Monochrome Topography &amp; Scalar Meshes</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label htmlFor="org-input" className="form-label">
                    ORGANIZATION / STUDIO (OPTIONAL)
                  </label>
                  <input
                    id="org-input"
                    type="text"
                    autoComplete="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Creative Agency, Production Co., or Independent"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="message-input" className="form-label">
                  {topic === 'artist_application'
                    ? 'ARTIST STATEMENT &amp; RESIDENCY VISION *'
                    : 'PROJECT SPECIFICATIONS & TIMELINE *'}
                </label>
                <textarea
                  id="message-input"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    topic === 'artist_application'
                      ? 'Outline your parametric techniques, artistic background, past generative releases, and desired resident collection themes...'
                      : 'Describe your project, required deliverables, timeline, or cel codes of interest...'
                  }
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-pill-primary btn-pill-lg contact-submit-btn"
              >
                {isSubmitting
                  ? 'Transmitting to Curatorial Desk...'
                  : topic === 'artist_application'
                  ? 'Submit Resident Artist Application'
                  : 'Transmit Inquiry'}
              </button>
            </form>
          )}

          {/* Curatorial Desk Verification & Role Administration Section */}
          <div className="curator-ceremony-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CURATORIAL CEREMONY DESK
                </span>
                <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.1rem', fontWeight: 600 }}>
                  Curator Verification &amp; Role Administration
                </h3>
              </div>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={() => setIsCeremonyDrawerOpen((prev) => !prev)}
              >
                {isCeremonyDrawerOpen ? 'Hide Desk ▲' : 'Open Curatorial Desk ▼'}
              </button>
            </div>

            {isCeremonyDrawerOpen && (
              <div style={{ marginTop: '1.25rem', padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
                  Curators and administrators can verify artist applications and toggle subscriber roles (<code style={{ fontSize: '0.8rem' }}>artist_resident</code>, <code style={{ fontSize: '0.8rem' }}>illustrator_pro</code>). Active verified accounts unlock immediate minting rights in <Link href="/studio/upload" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>/studio/upload</Link>.
                </p>

                {currentTier && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current Session Status:</span>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '8px', background: 'rgba(196, 150, 255, 0.15)', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {currentTier}
                    </span>
                    {(currentTier.startsWith('artist') || currentTier.startsWith('illustrator')) && (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Verified Creator</span>
                    )}
                  </div>
                )}

                {ceremonySuccessMsg && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {ceremonySuccessMsg}
                    <div style={{ marginTop: '0.75rem' }}>
                      <Link href="/studio/upload" className="btn-pill-primary btn-pill-sm" style={{ display: 'inline-flex' }}>
                        Launch Creator Studio ↗
                      </Link>
                    </div>
                  </div>
                )}

                {ceremonyErrorMsg && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {ceremonyErrorMsg}
                  </div>
                )}

                <form onSubmit={handleExecuteCeremony} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">SUBSCRIBER EMAIL TO VERIFY</label>
                      <input
                        type="email"
                        required
                        value={ceremonyTargetEmail}
                        onChange={(e) => setCeremonyTargetEmail(e.target.value)}
                        placeholder="artist@studioneo.tech"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">TARGET CURATORIAL ROLE / TIER</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="form-input"
                      >
                        <option value="artist_resident">artist_resident (Resident Studio Artist)</option>
                        <option value="illustrator_pro">illustrator_pro (Verified Vector Illustrator)</option>
                        <option value="artist">artist (Guest Artist)</option>
                        <option value="illustrator">illustrator (Guest Illustrator)</option>
                        <option value="studio-atelier">studio-atelier (Full Atelier Member)</option>
                        <option value="collector">collector (Archive Member)</option>
                        <option value="free">free (Public Visitor)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={isCeremonyLoading}
                      className="btn-pill-primary btn-pill-sm"
                    >
                      {isCeremonyLoading ? 'Executing Ceremony...' : 'Grant / Toggle Role'}
                    </button>
                    {sessionEmail && (
                      <button
                        type="button"
                        className="btn-pill-secondary btn-pill-sm"
                        onClick={() => setCeremonyTargetEmail(sessionEmail)}
                      >
                        Use My Email
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Studio Info Sidebar */}
        <aside className="contact-info-col" aria-label="Studio Contact Information">
          <div className="info-card">
            <h2>Direct Atelier Channels</h2>
            <div className="info-item">
              <span className="info-label">CURATORIAL DESK</span>
              <span className="info-val">curator@studioneo.tech</span>
            </div>
            <div className="info-item">
              <span className="info-label">RESIDENT ARTISTS DISPATCH</span>
              <span className="info-val">artists@studioneo.tech</span>
            </div>
            <div className="info-item">
              <span className="info-label">LICENSING &amp; RIGHTS</span>
              <span className="info-val">rights@studioneo.tech</span>
            </div>
            <div className="info-item">
              <span className="info-label">STUDIO HEADQUARTERS</span>
              <span className="info-val">Kawaguchi, Saitama &bull; Distributed Atelier</span>
            </div>
          </div>

          <div className="info-card">
            <h2>Resident Artist Program</h2>
            <p className="info-text">
              Selected resident artists receive unlimited vector stem minting privileges, Azure Blob Storage master persistence, and dedicated portfolio showcases at <code style={{ fontSize: '0.8rem' }}>/artist/[handle]</code>.
            </p>
          </div>

          <div className="info-card">
            <h2>Quick Links</h2>
            <div className="quick-links-list">
              <Link href="/studio/upload" className="quick-link-item">
                <span>Creator Studio (Minting Atelier)</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/artist/neo_tokyo" className="quick-link-item">
                <span>View Resident Artist Portfolio</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/gallery" className="quick-link-item">
                <span>Explore Full 128-Work Archive</span>
                <span aria-hidden="true">↗</span>
              </Link>
              <Link href="/membership" className="quick-link-item">
                <span>View Membership &amp; Vault Access Tiers</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

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
          <span>&copy; <time dateTime="2026">2026</time> studioNeo Archive. All curation rights preserved.</span>
          <span>studioneo.tech visual engineering</span>
        </div>
      </footer>
    </main>
  );
}

export default function ContactClient() {
  return (
    <Suspense fallback={<main id="main-content" className="contact-page" />}>
      <ContactFormContent />
    </Suspense>
  );
}
