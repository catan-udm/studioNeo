import React from 'react';
import '../projects/projects.css';
import './skeleton.css';

export default function ProjectsSkeleton() {
  return (
    <div className="projects-page skeleton-container-fade" aria-label="Loading projects..." aria-busy="true">
      {/* Header & Category Filters (Exact markup & classes) */}
      <header className="projects-header">
        <div className="projects-title-block">
          <span className="projects-subheading">
            <span className="skeleton-shimmer sk-pill" style={{ display: 'inline-block', width: '160px', height: '12px' }} />
          </span>
          <h1 className="projects-title" style={{ display: 'flex', justifyContent: 'center' }}>
            <span className="skeleton-shimmer" style={{ width: '280px', height: '52px', borderRadius: '8px' }} />
          </h1>
          <div className="projects-desc" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span className="skeleton-shimmer" style={{ width: '480px', height: '16px', maxWidth: '90%' }} />
            <span className="skeleton-shimmer" style={{ width: '380px', height: '16px', maxWidth: '75%' }} />
          </div>
        </div>

        <nav className="projects-nav-filters" aria-label="Project filters">
          {['All (4)', 'Animation (2)', 'Artwork (2)', 'Interactive (0)'].map((filter, idx) => (
            <span
              key={idx}
              className={`filter-btn ${idx === 0 ? 'active' : ''}`}
              style={{ pointerEvents: 'none' }}
            >
              {filter}
            </span>
          ))}
        </nav>

        <div className="projects-gallery-cta">
          <span className="projects-gallery-link-btn" style={{ pointerEvents: 'none', opacity: 0.9 }}>
            View Full Gallery Archive (128 Works) &rarr;
          </span>
        </div>
      </header>

      {/* Project Rows - EXACT .projects-list AND .project-row CLASSES */}
      <div className="projects-list">
        {Array.from({ length: 3 }).map((_, idx) => (
          <article key={idx} className="project-row">
            {/* Left Column: Sticky Project Metadata (exact 320px width) */}
            <div className="project-meta-col">
              <div className="project-meta-top">
                <span className="skeleton-shimmer" style={{ width: '32px', height: '22px' }} />
                <span className="skeleton-shimmer" style={{ width: '45px', height: '18px' }} />
              </div>

              <div className="project-title-group">
                <span className="skeleton-shimmer" style={{ width: '220px', height: '28px', borderRadius: '4px' }} />
                <span className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span className="skeleton-shimmer" style={{ width: '100%', height: '14px' }} />
                <span className="skeleton-shimmer" style={{ width: '85%', height: '14px' }} />
                <span className="skeleton-shimmer" style={{ width: '60%', height: '14px' }} />
              </div>

              {/* Spec List */}
              <div className="project-spec-list">
                <div className="project-spec-row">
                  <span className="project-spec-label">Category</span>
                  <span className="skeleton-shimmer" style={{ width: '90px', height: '14px' }} />
                </div>
                <div className="project-spec-row">
                  <span className="project-spec-label">Role</span>
                  <span className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
                </div>
                <div className="project-spec-row">
                  <span className="project-spec-label">Client</span>
                  <span className="skeleton-shimmer" style={{ width: '100px', height: '14px' }} />
                </div>
              </div>

              {/* Tags */}
              <div className="project-tag-chips">
                <span className="skeleton-shimmer sk-pill" style={{ width: '60px', height: '24px' }} />
                <span className="skeleton-shimmer sk-pill" style={{ width: '80px', height: '24px' }} />
                <span className="skeleton-shimmer sk-pill" style={{ width: '70px', height: '24px' }} />
              </div>

              {/* Reel Controls */}
              <div className="project-reel-controls">
                <span className="reel-nav-btn" style={{ pointerEvents: 'none', opacity: 0.6 }}>‹</span>
                <span className="reel-nav-btn" style={{ pointerEvents: 'none', opacity: 0.6 }}>›</span>
                <span className="skeleton-shimmer" style={{ width: '50px', height: '14px' }} />
              </div>
            </div>

            {/* Right Column: Horizontally Scrollable Filmstrip Reel Track - EXACT CLASSES */}
            <div className="project-reel-wrap">
              <div className="project-reel-track">
                <div className="project-media-card aspect-wide">
                  <div className="media-image-wrap">
                    <span className="skeleton-shimmer" style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                  <div className="media-card-badge">
                    <span className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
                    <span className="skeleton-shimmer" style={{ width: '60px', height: '14px' }} />
                  </div>
                </div>

                <div className="project-media-card aspect-wide">
                  <div className="media-image-wrap">
                    <span className="skeleton-shimmer" style={{ width: '100%', height: '100%', display: 'block' }} />
                  </div>
                  <div className="media-card-badge">
                    <span className="skeleton-shimmer" style={{ width: '120px', height: '14px' }} />
                    <span className="skeleton-shimmer" style={{ width: '60px', height: '14px' }} />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
