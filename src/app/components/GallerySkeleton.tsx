import React from 'react';
import '../gallery/gallery.css';
import './skeleton.css';

export default function GallerySkeleton() {
  return (
    <div className="gallery-page skeleton-container-fade" aria-label="Loading gallery archive..." aria-busy="true">
      {/* 1. Guest Preview / Notice Bar (Exact markup & classes) */}
      <section className="gallery-notice-bar">
        <div className="gallery-notice-inner">
          <div className="gallery-notice-text">
            <span className="gallery-notice-icon">🔓</span>
            <div className="skeleton-shimmer" style={{ width: '420px', height: '14px', maxWidth: '75vw' }} />
          </div>
          <div className="gallery-notice-actions">
            <div className="skeleton-shimmer sk-pill" style={{ width: '130px', height: '33px' }} />
            <div className="skeleton-shimmer sk-pill" style={{ width: '140px', height: '33px' }} />
            <div className="skeleton-shimmer sk-pill" style={{ width: '75px', height: '33px' }} />
          </div>
        </div>
      </section>

      {/* 2. Core Header & Typography (Exact markup & classes) */}
      <section className="gallery-header-section">
        <div className="gallery-core-header">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="gallery-overline" style={{ margin: '0 0 1rem' }}>
              <span className="skeleton-shimmer sk-pill" style={{ display: 'inline-block', width: '160px', height: '11px' }} />
            </span>
          </div>
          <h1 className="gallery-primary-heading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span className="skeleton-shimmer" style={{ width: '320px', height: '44px', borderRadius: '8px' }} />
          </h1>
          <div className="gallery-description" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span className="skeleton-shimmer" style={{ width: '560px', height: '16px', maxWidth: '90%' }} />
            <span className="skeleton-shimmer" style={{ width: '420px', height: '16px', maxWidth: '75%' }} />
          </div>
        </div>

        {/* Controls / Metadata Filter Bar (Exact markup & classes) */}
        <div className="gallery-meta-bar">
          <div className="gallery-meta-left">
            <span className="gallery-artist-select-label">ARTIST:</span>
            <div className="skeleton-shimmer sk-pill" style={{ width: '185px', height: '34px' }} />
          </div>

          <div className="gallery-meta-right">
            <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
              <span className="view-mode-btn active" style={{ pointerEvents: 'none' }}>
                <span className="view-mode-btn-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="18" rx="1.5" />
                    <rect x="14" y="3" width="7" height="18" rx="1.5" />
                  </svg>
                </span>
                <span className="view-mode-btn-text">Curated (3-Col)</span>
              </span>
              <span className="view-mode-btn" style={{ pointerEvents: 'none' }}>
                <span className="view-mode-btn-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </span>
                <span className="view-mode-btn-text">Feed (4-Col)</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Featured Resident Artist Information Card (Exact markup & classes) */}
        <section className="gallery-artist-card" aria-label="Featured artist profile">
          <div className="gallery-artist-left">
            <div className="gallery-artist-avatar">
              <span className="skeleton-shimmer sk-circle" style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
            <div className="gallery-artist-details">
              <div className="gallery-artist-title-row">
                <span className="skeleton-shimmer" style={{ width: '160px', height: '24px', borderRadius: '4px' }} />
                <span className="skeleton-shimmer" style={{ width: '100px', height: '14px', borderRadius: '4px' }} />
                <span className="gallery-artist-divider">•</span>
                <span className="skeleton-shimmer" style={{ width: '70px', height: '14px', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span className="skeleton-shimmer" style={{ width: '440px', height: '14px', maxWidth: '85%' }} />
                <span className="skeleton-shimmer" style={{ width: '360px', height: '14px', maxWidth: '70%' }} />
              </div>
            </div>
          </div>

          <div className="gallery-artist-right">
            <div className="gallery-artist-stats">
              <div className="artist-stat-item">
                <span className="skeleton-shimmer" style={{ width: '36px', height: '24px', margin: '0 auto 4px' }} />
                <span className="skeleton-shimmer" style={{ width: '120px', height: '11px' }} />
              </div>
              <div className="artist-stat-item">
                <span className="skeleton-shimmer" style={{ width: '36px', height: '24px', margin: '0 auto 4px' }} />
                <span className="skeleton-shimmer" style={{ width: '80px', height: '11px' }} />
              </div>
            </div>

            <div className="gallery-artist-actions">
              <div className="skeleton-shimmer sk-pill" style={{ width: '125px', height: '38px' }} />
              <div className="skeleton-shimmer sk-pill" style={{ width: '38px', height: '38px' }} />
              <div className="skeleton-shimmer sk-pill" style={{ width: '38px', height: '38px' }} />
            </div>
          </div>
        </section>

        {/* 4. Filter & Sorting Bar (Exact markup & classes) */}
        <div className="gallery-filter-bar">
          <div className="gallery-category-chips">
            {['All (128)', 'Generative (32)', 'Kinetic (28)', 'Vectors (26)', 'Mono (24)', 'Vaults (18)'].map((text, idx) => (
              <span
                key={idx}
                className={`category-chip-btn ${idx === 0 ? 'active' : ''}`}
                style={{ pointerEvents: 'none' }}
              >
                {text}
              </span>
            ))}
          </div>

          <div className="gallery-count-sort">
            <span className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
            <div className="skeleton-shimmer sk-pill" style={{ width: '175px', height: '34px' }} />
          </div>
        </div>

        {/* 5. Minimalist Instagram Cards Grid - EXACT ig-card CLASSES & 1:1 SQUARE TILES */}
        <div className="gallery-grid-wrap">
          <div className="gallery-cards-grid curated-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <article key={idx} className="ig-card">
                {/* Card Header */}
                <div className="ig-card-header">
                  <div className="ig-author-profile">
                    <div className="ig-avatar-ring">
                      <span className="skeleton-shimmer sk-circle" style={{ width: '100%', height: '100%', display: 'block' }} />
                    </div>
                    <div className="ig-author-meta">
                      <div className="ig-author-handle-row">
                        <span className="skeleton-shimmer" style={{ width: '90px', height: '12px' }} />
                      </div>
                      <span className="skeleton-shimmer" style={{ width: '65px', height: '10px' }} />
                    </div>
                  </div>

                  <div className="skeleton-shimmer sk-circle" style={{ width: '24px', height: '24px' }} />
                </div>

                {/* 1:1 Aspect Ratio Media Tile - EXACT SIZE */}
                <div className="ig-media-tile" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                  <span className="skeleton-shimmer" style={{ width: '100%', height: '100%', display: 'block' }} />
                </div>

                {/* Action Bar */}
                <div className="ig-action-bar">
                  <div className="ig-action-group-left">
                    <div className="skeleton-shimmer sk-circle" style={{ width: '22px', height: '22px' }} />
                    <div className="skeleton-shimmer sk-circle" style={{ width: '22px', height: '22px' }} />
                    <div className="skeleton-shimmer sk-circle" style={{ width: '22px', height: '22px' }} />
                  </div>
                  <div className="ig-action-group-right">
                    <div className="skeleton-shimmer sk-circle" style={{ width: '22px', height: '22px' }} />
                  </div>
                </div>

                {/* Card Content */}
                <div className="ig-card-content">
                  <div className="ig-likes-row">
                    <span className="skeleton-shimmer" style={{ width: '75px', height: '14px' }} />
                    <span className="skeleton-shimmer" style={{ width: '40px', height: '14px' }} />
                  </div>

                  <div className="ig-caption-block">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="skeleton-shimmer" style={{ width: '95%', height: '12px' }} />
                      <span className="skeleton-shimmer" style={{ width: '70%', height: '12px' }} />
                    </div>
                  </div>

                  <div className="ig-timestamp-row">
                    <span className="skeleton-shimmer" style={{ width: '160px', height: '10px' }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
