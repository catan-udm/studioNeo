'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSettings, UiScaleMode } from './SettingsProvider';
import './settingsModal.css';

export default function SettingsModal() {
  const {
    theme,
    resolvedTheme,
    oledMode,
    isOledDetected,
    isOledActive,
    uiScale,
    motion,
    isSettingsOpen,
    setTheme,
    setOledMode,
    setUiScale,
    setMotion,
    closeSettings,
    resetSettings,
  } = useSettings();

  // Close on Escape
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return (
    <div
      className="settings-modal-backdrop"
      onClick={closeSettings}
      role="dialog"
      aria-modal="true"
      aria-label="Display and UI Settings"
    >
      <div
        className="settings-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="settings-modal-header">
          <div className="settings-modal-title-group">
            <div className="settings-modal-title-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="settings-modal-title">Studio Settings</h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Active: {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} • Scale {uiScale}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="settings-modal-close-btn"
            onClick={closeSettings}
            aria-label="Close settings"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="settings-modal-body">
          {/* 1. Theme Control */}
          <section>
            <div className="settings-section-header">
              <h3 className="settings-section-title">Color Theme</h3>
              <p className="settings-section-desc">Select an appearance mode or sync with system preferences.</p>
            </div>
            <div className="settings-pill-group" role="radiogroup" aria-label="Theme selection">
              <button
                type="button"
                className={`settings-pill-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setTheme('system')}
                role="radio"
                aria-checked={theme === 'system'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <span>System</span>
                <span className="settings-pill-sub">Auto</span>
              </button>

              <button
                type="button"
                className={`settings-pill-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                role="radio"
                aria-checked={theme === 'light'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                <span>Light</span>
                <span className="settings-pill-sub">Clean</span>
              </button>

              <button
                type="button"
                className={`settings-pill-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                role="radio"
                aria-checked={theme === 'dark'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
                <span>Dark</span>
                <span className="settings-pill-sub">{isOledActive ? 'OLED Black' : 'Neutral Gray'}</span>
              </button>
            </div>

            {/* Dark Mode Surface / OLED Display Controls */}
            {resolvedTheme === 'dark' && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div className="settings-section-header" style={{ marginBottom: '0.75rem' }}>
                  <h4 className="settings-section-title" style={{ fontSize: '0.85rem' }}>
                    Dark Mode Surface &amp; Display
                  </h4>
                  <p className="settings-section-desc">
                    {isOledActive
                      ? 'Pure Blacks (#000000) active for OLED pixel shutoff & battery efficiency.'
                      : 'Neutral very dark gray (#121316) active for non-OLED & LCD screens.'}
                  </p>
                </div>
                <div className="settings-pill-group" role="radiogroup" aria-label="Dark mode OLED display surface selection">
                  <button
                    type="button"
                    className={`settings-pill-btn ${oledMode === 'auto' ? 'active' : ''}`}
                    onClick={() => setOledMode('auto')}
                    role="radio"
                    aria-checked={oledMode === 'auto'}
                  >
                    <span>Auto-Detect</span>
                    <span className="settings-pill-sub">{isOledDetected ? 'OLED Detected' : 'LCD / Neutral'}</span>
                  </button>

                  <button
                    type="button"
                    className={`settings-pill-btn ${oledMode === 'oled' ? 'active' : ''}`}
                    onClick={() => setOledMode('oled')}
                    role="radio"
                    aria-checked={oledMode === 'oled'}
                  >
                    <span>Pure Black</span>
                    <span className="settings-pill-sub">OLED (#000000)</span>
                  </button>

                  <button
                    type="button"
                    className={`settings-pill-btn ${oledMode === 'neutral' ? 'active' : ''}`}
                    onClick={() => setOledMode('neutral')}
                    role="radio"
                    aria-checked={oledMode === 'neutral'}
                  >
                    <span>Neutral Gray</span>
                    <span className="settings-pill-sub">Non-OLED (#121316)</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 2. UI Scaling Control */}
          <section>
            <div className="settings-section-header">
              <h3 className="settings-section-title">UI Scale &amp; Typography</h3>
              <p className="settings-section-desc">Scale layout proportions, navigation, and text dynamically.</p>
            </div>
            <div className="settings-pill-group grid-4" role="radiogroup" aria-label="UI scale selection">
              {(
                [
                  { id: 'compact', label: 'Compact', sub: '90%' },
                  { id: 'default', label: 'Default', sub: '100%' },
                  { id: 'comfortable', label: 'Comfort', sub: '110%' },
                  { id: 'large', label: 'Large', sub: '120%' },
                ] as { id: UiScaleMode; label: string; sub: string }[]
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`settings-pill-btn ${uiScale === s.id ? 'active' : ''}`}
                  onClick={() => setUiScale(s.id)}
                  role="radio"
                  aria-checked={uiScale === s.id}
                >
                  <span>{s.label}</span>
                  <span className="settings-pill-sub">{s.sub}</span>
                </button>
              ))}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="settings-preview-card">
              <div className="settings-preview-meta">
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  LIVE FONT &amp; BUTTON SCALE PREVIEW
                </span>
                <span className="settings-preview-badge">
                  {uiScale === 'compact' ? '0.90x' : uiScale === 'default' ? '1.00x' : uiScale === 'comfortable' ? '1.10x' : '1.20x'}
                </span>
              </div>
              <p className="settings-preview-text">
                bikko.studio • Creative Code, Kinetic Motion &amp; Next-Gen Identity.
              </p>
            </div>
          </section>

          {/* 3. Motion & Dynamics */}
          <section>
            <div className="settings-section-header">
              <h3 className="settings-section-title">Motion Physics</h3>
              <p className="settings-section-desc">
                {motion === 'system'
                  ? 'System: Synchronizes with your device accessibility preference.'
                  : motion === 'full'
                  ? 'Full Motion: Fluid spring dynamics and sliding animations.'
                  : motion === 'interactive'
                  ? 'Interactive: Tactile micro-interactions with non-sliding animations.'
                  : 'Reduced Motion: Preserves essential loading skeletons & progress bars only.'}
              </p>
            </div>
            <div className="settings-pill-group grid-4" role="radiogroup" aria-label="Motion physics">
              <button
                type="button"
                className={`settings-pill-btn ${motion === 'system' ? 'active' : ''}`}
                onClick={() => setMotion('system')}
                role="radio"
                aria-checked={motion === 'system'}
              >
                <span>System</span>
                <span className="settings-pill-sub">OS Auto</span>
              </button>

              <button
                type="button"
                className={`settings-pill-btn ${motion === 'full' ? 'active' : ''}`}
                onClick={() => setMotion('full')}
                role="radio"
                aria-checked={motion === 'full'}
              >
                <span>Full Motion</span>
                <span className="settings-pill-sub">Sliding</span>
              </button>

              <button
                type="button"
                className={`settings-pill-btn ${motion === 'interactive' ? 'active' : ''}`}
                onClick={() => setMotion('interactive')}
                role="radio"
                aria-checked={motion === 'interactive'}
              >
                <span>Interactive</span>
                <span className="settings-pill-sub">Non-Sliding</span>
              </button>

              <button
                type="button"
                className={`settings-pill-btn ${motion === 'reduced' ? 'active' : ''}`}
                onClick={() => setMotion('reduced')}
                role="radio"
                aria-checked={motion === 'reduced'}
              >
                <span>Reduced</span>
                <span className="settings-pill-sub">Skeletons</span>
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="settings-modal-footer">
          <Link
            href="/settings"
            onClick={closeSettings}
            className="settings-footer-link"
          >
            Open Full Settings Page &rarr;
          </Link>

          <button
            type="button"
            onClick={resetSettings}
            className="settings-reset-btn"
          >
            Reset Defaults
          </button>
        </footer>
      </div>
    </div>
  );
}
