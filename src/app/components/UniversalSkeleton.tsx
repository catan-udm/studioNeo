import React from 'react';
import '../about/about.css';
import './skeleton.css';

export default function UniversalSkeleton() {
  return (
    <div className="about-page skeleton-container-fade" aria-label="Loading page..." aria-busy="true">
      <div className="about-minimal-container">
        {/* Insignia Mark Placeholder */}
        <div className="about-mark-wrap">
          <div className="skeleton-shimmer sk-circle" style={{ width: '64px', height: '56px' }} />
        </div>

        {/* Header Block */}
        <header className="about-header" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <span className="skeleton-shimmer sk-pill" style={{ display: 'inline-block', width: '180px', height: '12px' }} />
          </div>
          <h1 className="about-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span className="skeleton-shimmer" style={{ width: '90%', height: '44px', borderRadius: '8px' }} />
            <span className="skeleton-shimmer" style={{ width: '70%', height: '44px', borderRadius: '8px' }} />
          </h1>
          <div className="about-lead" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span className="skeleton-shimmer" style={{ width: '100%', height: '16px' }} />
            <span className="skeleton-shimmer" style={{ width: '75%', height: '16px' }} />
          </div>
        </header>

        {/* 3 Tenet Rows */}
        <section className="about-tenets" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="tenet-row">
              <span className="tenet-index">
                <span className="skeleton-shimmer" style={{ display: 'inline-block', width: '24px', height: '20px' }} />
              </span>
              <div className="tenet-content" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="skeleton-shimmer" style={{ width: '160px', height: '22px', borderRadius: '4px' }} />
                <span className="skeleton-shimmer" style={{ width: '95%', height: '14px' }} />
                <span className="skeleton-shimmer" style={{ width: '80%', height: '14px' }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
