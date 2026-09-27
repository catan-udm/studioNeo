'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings, UiScaleMode } from '../components/SettingsProvider';
import { getAuthenticatedSession } from '@/lib/clientAuthCache';
import './settings.css';

export default function SettingsClient() {
  const {
    theme,
    resolvedTheme,
    oledMode,
    isOledDetected,
    isOledActive,
    uiScale,
    motion,
    setTheme,
    setOledMode,
    setUiScale,
    setMotion,
    resetSettings,
  } = useSettings();

  const [savedCount, setSavedCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Check saved works count in localStorage and session
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('studioNeo_saved_works');
        if (stored) {
          const arr = JSON.parse(stored);
          if (Array.isArray(arr)) setSavedCount(arr.length);
        }
      } catch {}

      getAuthenticatedSession()
        .then((data) => {
          if (data?.authenticated) {
            setIsAuthenticated(true);
            setUserEmail(data.subscriber?.email || 'Subscriber');
          }
        })
        .catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearCollection = () => {
    if (!confirm('Clear all saved works from your local archive collection?')) return;
    try {
      localStorage.removeItem('studioNeo_saved_works');
      setSavedCount(0);
      showToast('Saved collection cleared.');
    } catch {}
  };

  return (
    <main id="main-content" className="settings-page">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'var(--text-primary)',
            color: 'var(--bg-canvas)',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '0.86rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 3000,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Hero Header */}
      <header className="settings-hero">
        <span className="settings-hero-overline">ATELIER CONFIGURATION</span>
        <h1 className="settings-hero-title">Studio Settings</h1>
        <p className="settings-hero-desc">
          Configure real-time appearance themes, typography scaling, fluid kinetic dynamics, and local cache preferences.
        </p>
      </header>

      <div className="settings-grid">
        {/* Section 1: Appearance & Theme */}
        <section className="settings-card" id="theme-settings">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-card-title">Color Appearance</h2>
              <p className="settings-card-desc">
                Toggle between pure OLED Dark Mode, clean minimalist Light Mode, or automatic synchronization with your operating system.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Active: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>

          <div className="theme-cards-grid" role="radiogroup" aria-label="Appearance Theme">
            {/* System */}
            <div
              className={`theme-card-option ${theme === 'system' ? 'active' : ''}`}
              onClick={() => setTheme('system')}
              role="radio"
              aria-checked={theme === 'system'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTheme('system')}
            >
              <div className="theme-card-preview preview-system">
                <span>System Auto</span>
              </div>
              <span className="theme-card-label">System Sync</span>
              <span className="theme-card-sub">Follows Device OS</span>
            </div>

            {/* Light */}
            <div
              className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              role="radio"
              aria-checked={theme === 'light'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTheme('light')}
            >
              <div className="theme-card-preview preview-light">
                <span>Clean Light</span>
              </div>
              <span className="theme-card-label">Light Mode</span>
              <span className="theme-card-sub">High-contrast daytime</span>
            </div>

            {/* Dark */}
            <div
              className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              role="radio"
              aria-checked={theme === 'dark'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setTheme('dark')}
            >
              <div className="theme-card-preview preview-dark">
                <span>{isOledActive ? 'Pure Black' : 'Dark Gray'}</span>
              </div>
              <span className="theme-card-label">Dark Mode</span>
              <span className="theme-card-sub">{isOledActive ? 'OLED Pure Black' : 'Neutral Slate Gray'}</span>
            </div>
          </div>

          {/* Dark Mode Surface / OLED Display Controls */}
          {resolvedTheme === 'dark' && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>
                  Dark Mode Surface &amp; OLED Optimization
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {isOledActive
                    ? 'Pure Blacks (#000000) active for full OLED pixel shutoff & battery efficiency.'
                    : 'Neutral very dark gray (#121316) active for non-OLED & LCD screens.'}
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <button
                  type="button"
                  data-oled-mode="auto"
                  className={`btn ${oledMode === 'auto' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOledMode('auto')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', gap: '2px', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Auto-Detect</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{isOledDetected ? 'OLED Detected' : 'LCD / Neutral'}</span>
                </button>
                <button
                  type="button"
                  data-oled-mode="oled"
                  className={`btn ${oledMode === 'oled' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOledMode('oled')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', gap: '2px', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Pure Black</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>OLED (#000000)</span>
                </button>
                <button
                  type="button"
                  data-oled-mode="neutral"
                  className={`btn ${oledMode === 'neutral' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOledMode('neutral')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.75rem 0.5rem', gap: '2px', borderRadius: '12px' }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Neutral Gray</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Non-OLED (#121316)</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Section 2: UI Scaling & Proportions */}
        <section className="settings-card" id="scaling-settings">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-card-title">UI Scale &amp; Proportions</h2>
              <p className="settings-card-desc">
                Adjust the base font size and layout proportions. All typography and interactive elements adapt fluidly.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--brand-primary)',
                color: '#ffffff',
              }}
            >
              Scale: {uiScale === 'compact' ? '90%' : uiScale === 'default' ? '100%' : uiScale === 'comfortable' ? '110%' : '120%'}
            </span>
          </div>

          <div className="scale-controls-row" role="radiogroup" aria-label="UI scale factor">
            {(
              [
                { id: 'compact', label: 'Compact', sub: '90% (Dense)' },
                { id: 'default', label: 'Default', sub: '100% (Standard)' },
                { id: 'comfortable', label: 'Comfort', sub: '110% (Spacious)' },
                { id: 'large', label: 'Large', sub: '120% (Accessibility)' },
              ] as { id: UiScaleMode; label: string; sub: string }[]
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                className={`scale-btn ${uiScale === s.id ? 'active' : ''}`}
                onClick={() => setUiScale(s.id)}
                role="radio"
                aria-checked={uiScale === s.id}
              >
                <span>{s.label}</span>
                <span className="scale-btn-sub">{s.sub}</span>
              </button>
            ))}
          </div>

          {/* Interactive Live Specimen Card */}
          <div className="settings-specimen">
            <div className="settings-specimen-header">
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                DYNAMIC SPECIMEN COMPONENT
              </span>
              <span className="specimen-badge">Live Preview</span>
            </div>
            <h3 className="specimen-h3">Algorithmic Vector Cels &bull; studioNeo</h3>
            <p className="specimen-p">
              Lossless mathematical vectors scale crisply across ultra-dense Retina mobile screens and 4K studio monitors.
            </p>
            <div className="specimen-actions">
              <button
                type="button"
                className="btn-pill-primary btn-pill-sm"
                onClick={() => showToast('Specimen button clicked!')}
              >
                Sample Action
              </button>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={() => showToast('Specimen secondary button clicked!')}
              >
                Secondary
              </button>
            </div>
          </div>
        </section>

        {/* Section 3: Kinetic Motion & Physics */}
        <section className="settings-card" id="motion-settings">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-card-title">Motion Dynamics &amp; Transitions</h2>
              <p className="settings-card-desc">
                Configure UI motion physics, sliding drawer animations, non-sliding interactive feedback, or essential loading animations.
              </p>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'var(--brand-primary)',
                color: '#ffffff',
                whiteSpace: 'nowrap',
              }}
            >
              Mode: {motion === 'system' ? 'System' : motion === 'full' ? 'Full' : motion === 'interactive' ? 'Interactive' : 'Reduced'}
            </span>
          </div>

          <div className="motion-toggle-grid" role="radiogroup" aria-label="Motion preference">
            <button
              type="button"
              className={`motion-btn ${motion === 'system' ? 'active' : ''}`}
              onClick={() => setMotion('system')}
              role="radio"
              aria-checked={motion === 'system'}
            >
              <strong>System Default</strong>
              <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>Follows device OS preference</span>
            </button>

            <button
              type="button"
              className={`motion-btn ${motion === 'full' ? 'active' : ''}`}
              onClick={() => setMotion('full')}
              role="radio"
              aria-checked={motion === 'full'}
            >
              <strong>Full Motion</strong>
              <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>Sliding drawers &amp; fluid springs</span>
            </button>

            <button
              type="button"
              className={`motion-btn ${motion === 'interactive' ? 'active' : ''}`}
              onClick={() => setMotion('interactive')}
              role="radio"
              aria-checked={motion === 'interactive'}
            >
              <strong>Interactive</strong>
              <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>Non-sliding micro-animations</span>
            </button>

            <button
              type="button"
              className={`motion-btn ${motion === 'reduced' ? 'active' : ''}`}
              onClick={() => setMotion('reduced')}
              role="radio"
              aria-checked={motion === 'reduced'}
            >
              <strong>Reduced Motion</strong>
              <span style={{ fontSize: '0.74rem', opacity: 0.8 }}>Essential skeletons &amp; bars only</span>
            </button>
          </div>

          {/* Active Motion Mode Explanation Card */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '12px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
            }}
          >
            {motion === 'system' && (
              <p style={{ margin: 0 }}>
                <strong>System Sync Active:</strong> Automatically responds to your operating system&rsquo;s &ldquo;Reduce motion&rdquo; accessibility toggle.
              </p>
            )}
            {motion === 'full' && (
              <p style={{ margin: 0 }}>
                <strong>Full Motion Active:</strong> All kinetic physics enabled, including smooth sliding drawers, fluid floating bubble shifts, and upward page transitions.
              </p>
            )}
            {motion === 'interactive' && (
              <p style={{ margin: 0 }}>
                <strong>Interactive Active:</strong> Tactile feedback preserved with pure non-sliding animations (clean crossfades, button colors, and hover states with zero spatial movement or sliding).
              </p>
            )}
            {motion === 'reduced' && (
              <p style={{ margin: 0 }}>
                <strong>Reduced Motion Active:</strong> Decorative animations and movement transitions are disabled. Only essential status features like loading skeletons and progress bars remain animated.
              </p>
            )}
          </div>
        </section>

        {/* Section 4: Account & Security */}
        <section className="settings-card" id="account-settings">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-card-title">Account &amp; Passkeys</h2>
              <p className="settings-card-desc">
                {isAuthenticated
                  ? `Signed in as ${userEmail}. Manage your FIDO2 passkeys, multi-factor auth, and cloud accounts.`
                  : 'You are browsing as a guest. Settings are saved locally on this browser. Create an account to sync unlocks and passkeys.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-pill-primary">
                Open Subscriber Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-pill-primary">
                  Sign In
                </Link>
                <Link href="/register" className="btn-pill-secondary">
                  Create Passkey Account
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Section 5: Cache & Local Storage */}
        <section className="settings-card" id="storage-settings">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-card-title">Local Storage &amp; Cache</h2>
              <p className="settings-card-desc">
                Manage locally cached preferences, saved works, and display state.
              </p>
            </div>
          </div>

          <div className="storage-stats-row">
            <div className="storage-stats-info">
              <span className="storage-stats-label">Saved Works in Archive</span>
              <span className="storage-stats-val">{savedCount} items</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleClearCollection}
                className="btn-pill-secondary btn-pill-sm"
                disabled={savedCount === 0}
              >
                Clear Saved Works
              </button>
              <button
                type="button"
                onClick={() => {
                  resetSettings();
                  showToast('Settings reset to factory defaults.');
                }}
                className="btn-pill-secondary btn-pill-sm"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
