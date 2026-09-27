import React from 'react';
import './collection.css';
import '../components/skeleton.css';

export default function CollectionLoading() {
  return (
    <div className="collection-page skeleton-container-fade" aria-label="Loading saved collection..." aria-busy="true">
      {/* 1. Header (Exact markup & classes) */}
      <section className="collection-hero">
        <span className="collection-overline">
          <span className="skeleton-shimmer sk-pill" style={{ display: 'inline-block', width: '220px', height: '11px' }} />
        </span>
        <h1 className="collection-title" style={{ display: 'flex', justifyContent: 'center' }}>
          <span className="skeleton-shimmer" style={{ width: '320px', height: '44px', borderRadius: '8px' }} />
        </h1>
        <div className="collection-lead" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span className="skeleton-shimmer" style={{ width: '560px', height: '16px', maxWidth: '90%' }} />
          <span className="skeleton-shimmer" style={{ width: '380px', height: '16px', maxWidth: '75%' }} />
        </div>

        {/* 2. Collection Metrics Bar */}
        <div className="collection-metrics-bar">
          <div className="collection-metric-card">
            <span className="metric-num">
              <span className="skeleton-shimmer" style={{ width: '36px', height: '28px', margin: '0 auto' }} />
            </span>
            <span className="metric-label">
              <span className="skeleton-shimmer" style={{ width: '70px', height: '11px', margin: '0 auto' }} />
            </span>
          </div>
          <div className="collection-metric-card">
            <span className="metric-num">
              <span className="skeleton-shimmer" style={{ width: '55px', height: '28px', margin: '0 auto' }} />
            </span>
            <span className="metric-label">
              <span className="skeleton-shimmer" style={{ width: '90px', height: '11px', margin: '0 auto' }} />
            </span>
          </div>
          <div className="collection-metric-card">
            <span className="metric-num">
              <span className="skeleton-shimmer" style={{ width: '30px', height: '28px', margin: '0 auto' }} />
            </span>
            <span className="metric-label">
              <span className="skeleton-shimmer" style={{ width: '95px', height: '11px', margin: '0 auto' }} />
            </span>
          </div>
        </div>
      </section>

      {/* 3. Toolbar & Actions */}
      <section className="collection-toolbar">
        <div className="collection-tabs">
          <span className="collection-tab-btn active" style={{ pointerEvents: 'none' }}>All Saved (3)</span>
          <span className="collection-tab-btn" style={{ pointerEvents: 'none' }}>♥ Favorites (0)</span>
          <span className="collection-tab-btn" style={{ pointerEvents: 'none' }}>Public Cels</span>
        </div>

        <div className="collection-actions-group">
          <span className="btn-pill-secondary btn-pill-sm" style={{ pointerEvents: 'none', opacity: 0.7 }}>Export Manifest (JSON)</span>
          <span className="btn-pill-primary btn-pill-sm" style={{ pointerEvents: 'none', opacity: 0.7 }}>+ Explore Gallery</span>
        </div>
      </section>

      {/* 4. Main Cards Grid - EXACT collection-card CLASSES */}
      <section className="collection-grid-container">
        <div className="collection-cards-grid">
          {Array.from({ length: 3 }).map((_, idx) => (
            <article key={idx} className="collection-card">
              <div className="collection-card-header">
                <div className="collection-card-author">
                  <div className="collection-avatar-ring">
                    <span className="skeleton-shimmer sk-circle" style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                  <div className="collection-author-meta">
                    <span className="skeleton-shimmer" style={{ width: '85px', height: '12px' }} />
                    <span className="skeleton-shimmer" style={{ width: '110px', height: '11px' }} />
                  </div>
                </div>
                <div className="skeleton-shimmer sk-circle" style={{ width: '22px', height: '22px' }} />
              </div>

              {/* 1:1 Aspect Ratio Artwork Media */}
              <div className="collection-card-media" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                <span className="skeleton-shimmer" style={{ width: '100%', height: '100%', display: 'block' }} />
              </div>

              {/* Card Bottom Actions */}
              <div className="collection-card-actions">
                <div className="collection-actions-left">
                  <div className="skeleton-shimmer sk-circle" style={{ width: '20px', height: '20px' }} />
                  <div className="skeleton-shimmer sk-circle" style={{ width: '20px', height: '20px' }} />
                  <div className="skeleton-shimmer sk-circle" style={{ width: '20px', height: '20px' }} />
                </div>
                <span className="skeleton-shimmer" style={{ width: '45px', height: '14px' }} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
