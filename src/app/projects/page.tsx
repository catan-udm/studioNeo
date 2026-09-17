'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { projectsData, ProjectRow, ProjectMediaItem } from './projectsData';
import './projects.css';

type CategoryFilter = 'All' | 'Animation' | 'Artwork' | 'Interactive';

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [activeLightbox, setActiveLightbox] = useState<{
    project: ProjectRow;
    mediaIndex: number;
  } | null>(null);

  // Per-row refs for smooth horizontal scroll buttons
  const reelRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter projects by category
  const filteredProjects = projectsData.filter((project) => {
    if (selectedCategory === 'All') return true;
    return project.category === selectedCategory;
  });

  // Calculate category counts
  const categoryCounts: Record<CategoryFilter, number> = {
    All: projectsData.length,
    Animation: projectsData.filter((p) => p.category === 'Animation').length,
    Artwork: projectsData.filter((p) => p.category === 'Artwork').length,
    Interactive: projectsData.filter((p) => p.category === 'Interactive').length,
  };

  // Horizontal scroll triggers
  const scrollReel = (projectId: string, direction: 'left' | 'right') => {
    const el = reelRefs.current[projectId];
    if (el) {
      const scrollAmount = Math.min(el.clientWidth * 0.75, 520);
      el.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Lightbox keyboard navigation & body scroll lock
  const nextLightboxItem = useCallback(() => {
    if (!activeLightbox) return;
    const { project, mediaIndex } = activeLightbox;
    const nextIndex = (mediaIndex + 1) % project.media.length;
    setActiveLightbox({ project, mediaIndex: nextIndex });
  }, [activeLightbox]);

  const prevLightboxItem = useCallback(() => {
    if (!activeLightbox) return;
    const { project, mediaIndex } = activeLightbox;
    const prevIndex = (mediaIndex - 1 + project.media.length) % project.media.length;
    setActiveLightbox({ project, mediaIndex: prevIndex });
  }, [activeLightbox]);

  const closeLightbox = useCallback(() => {
    setActiveLightbox(null);
  }, []);

  useEffect(() => {
    if (!activeLightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxItem();
      if (e.key === 'ArrowLeft') prevLightboxItem();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeLightbox, closeLightbox, nextLightboxItem, prevLightboxItem]);

  const currentMedia: ProjectMediaItem | null = activeLightbox
    ? activeLightbox.project.media[activeLightbox.mediaIndex]
    : null;

  return (
    <main className="projects-page">
      {/* Header & Minimalist Filter Bar */}
      <header className="projects-header">
        <div className="projects-title-block">
          <span className="projects-subheading">
            <span className="live-dot" /> Archive &amp; Key Works
          </span>
          <h1 className="projects-title">PROJECTS</h1>
        </div>

        {/* Categories Bar */}
        <nav className="projects-nav-filters" aria-label="Project categories">
          {(['All', 'Animation', 'Artwork', 'Interactive'] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
              <span className="filter-count">({categoryCounts[cat]})</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Projects List: Horizontal Row Filmstrips */}
      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="projects-empty">
            <p>No projects found in this category.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <article key={project.id} className="project-row" id={`project-${project.id}`}>
              {/* Left Column: Sticky Project Metadata */}
              <div className="project-meta-col">
                <div className="project-meta-top">
                  <span className="project-index">{project.index}</span>
                  <span className="project-year-badge">{project.year}</span>
                </div>

                <div className="project-title-group">
                  <h2 className="project-name">{project.title}</h2>
                  {project.japaneseTitle && (
                    <span className="project-name-jp">{project.japaneseTitle}</span>
                  )}
                </div>

                <p className="project-desc">{project.description}</p>

                <div className="project-spec-list">
                  <div className="project-spec-row">
                    <span className="project-spec-label">Category</span>
                    <span className="project-spec-value">{project.category}</span>
                  </div>
                  <div className="project-spec-row">
                    <span className="project-spec-label">Role</span>
                    <span className="project-spec-value">{project.role}</span>
                  </div>
                  {project.client && (
                    <div className="project-spec-row">
                      <span className="project-spec-label">Client</span>
                      <span className="project-spec-value">{project.client}</span>
                    </div>
                  )}
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div className="project-tag-chips">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Horizontal scroll arrow buttons */}
                <div className="project-reel-controls" aria-label={`Scroll controls for ${project.title}`}>
                  <button
                    type="button"
                    className="reel-nav-btn"
                    onClick={() => scrollReel(project.id, 'left')}
                    aria-label="Scroll reel left"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="reel-nav-btn"
                    onClick={() => scrollReel(project.id, 'right')}
                    aria-label="Scroll reel right"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="reel-counter-text">{project.media.length} CUTS</span>
                </div>
              </div>

              {/* Right Column: Horizontally Scrollable Filmstrip Reel */}
              <div className="project-reel-wrap">
                <div
                  ref={(el) => {
                    reelRefs.current[project.id] = el;
                  }}
                  className="project-reel-track"
                  role="region"
                  aria-label={`Media reel for ${project.title}`}
                  tabIndex={0}
                >
                  {project.media.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`project-media-card aspect-${item.aspectRatio || 'wide'}`}
                      onClick={() => setActiveLightbox({ project, mediaIndex: idx })}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open cut ${idx + 1}: ${item.title}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveLightbox({ project, mediaIndex: idx });
                        }
                      }}
                    >
                      <div className="media-image-wrap">
                        <img
                          src={item.src}
                          alt={item.title}
                          loading="lazy"
                        />
                      </div>
                      <div className="media-card-badge">
                        <span className="badge-text">{item.title}</span>
                        <span className="badge-action">
                          CUT {String(idx + 1).padStart(2, '0')}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Apple Glassmorphic Lightbox Modal */}
      {activeLightbox && currentMedia && (
        <div
          className="projects-lightbox-backdrop"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={currentMedia.title}
        >
          {/* Navigation Arrows */}
          <button
            type="button"
            className="lightbox-arrow-btn lightbox-arrow-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevLightboxItem();
            }}
            aria-label="Previous cut"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            className="lightbox-arrow-btn lightbox-arrow-next"
            onClick={(e) => {
              e.stopPropagation();
              nextLightboxItem();
            }}
            aria-label="Next cut"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="projects-lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              &times;
            </button>

            <div className="lightbox-image-wrap">
              <img src={currentMedia.src} alt={currentMedia.title} />
            </div>

            <div className="lightbox-info">
              <span className="lightbox-title">{currentMedia.title}</span>
              <p className="lightbox-caption">{currentMedia.caption}</p>
              <span style={{ fontSize: '0.72rem', opacity: 0.6, letterSpacing: '0.05em' }}>
                CUT {activeLightbox.mediaIndex + 1} OF {activeLightbox.project.media.length} &bull; {activeLightbox.project.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
