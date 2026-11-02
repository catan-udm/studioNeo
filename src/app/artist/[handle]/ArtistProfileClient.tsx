'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ALL_GALLERY_WORKS,
  RESIDENT_ARTISTS,
  GalleryWork,
  ResidentArtist,
  isVaultSubscriberTier,
  mapDbCelToGalleryWork,
  exportGalleryWork,
} from '../../gallery/galleryData';
import ArtworkCanvas from '../../components/ArtworkCanvas';
import { getAuthenticatedSession } from '@/lib/clientAuthCache';
import './artistProfile.css';

interface ArtistProfileClientProps {
  handle: string;
}

export default function ArtistProfileClient({ handle }: ArtistProfileClientProps) {
  const cleanHandle = (handle || '').toLowerCase().trim();

  // Find Resident Artist or construct dynamic record
  const artist: ResidentArtist = useMemo(() => {
    const found = RESIDENT_ARTISTS.find((a) => a.handle.toLowerCase() === cleanHandle);
    if (found) return found;

    // Dynamic Artist profile fallback
    const readableName = cleanHandle
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id: `artist-${cleanHandle}`,
      name: readableName || 'Resident Artist',
      handle: cleanHandle,
      location: 'Tokyo / Global Atelier',
      role: 'Verified Resident Creator',
      bio: 'Algorithmic studio cels, procedural vector investigations, and kinetic digital editions curated at studioNeo.',
      collection: `${readableName} Genesis`,
      archivedWorksCount: 24,
      publicWorksCount: 16,
      editionsCount: 88,
    };
  }, [cleanHandle]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeWork, setActiveWork] = useState<GalleryWork | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFeaturedAuthorized, setIsFeaturedAuthorized] = useState(false);
  const [dynamicCels, setDynamicCels] = useState<GalleryWork[]>([]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Fetch Session & Dynamic Cels from DB
  useEffect(() => {
    const timer = setTimeout(() => {
      getAuthenticatedSession().then((session) => {
        if (session.authenticated && session.subscriber && isVaultSubscriberTier(session.subscriber.tier)) {
          setIsFeaturedAuthorized(true);
        }
      }).catch(() => {});

      // Query DB for newly minted cels by this artist
      fetch(`/api/cels?artist=${cleanHandle}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.cels)) {
            setDynamicCels(data.cels.map(mapDbCelToGalleryWork));
          }
        })
        .catch(() => {});
    }, 0);

    return () => clearTimeout(timer);
  }, [cleanHandle]);

  // Combine static archive works with database minted cels
  const artistWorks: GalleryWork[] = useMemo(() => {
    const archiveFiltered = ALL_GALLERY_WORKS.filter(
      (w) => w.artistHandle.toLowerCase() === cleanHandle
    );

    // Merge without duplicates by code
    const combined = [...dynamicCels, ...archiveFiltered];
    const seenCodes = new Set<string>();
    const deduplicated: GalleryWork[] = [];

    for (const w of combined) {
      if (!seenCodes.has(w.code)) {
        seenCodes.add(w.code);
        deduplicated.push(w);
      }
    }

    return deduplicated;
  }, [cleanHandle, dynamicCels]);

  const filteredWorks = useMemo(() => {
    if (selectedCategory === 'All') return artistWorks;
    if (selectedCategory === 'Vaults') return artistWorks.filter((w) => w.isVault);
    return artistWorks.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, artistWorks]);

  // Download Handler (Respecting monetization & vault semantics)
  const handleExport = useCallback(
    (work: GalleryWork, format: 'svg' | 'png' | 'jpg' | 'gif', e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      exportGalleryWork(work, format, {
        isAuthorized: isFeaturedAuthorized,
        onToast: showToast,
        requireAuthForMaster: true,
      });
    },
    [isFeaturedAuthorized, showToast]
  );

  return (
    <main id="main-content" className="artist-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ig-toast" role="status" aria-live="polite" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000, background: 'var(--text-primary)', color: 'var(--bg-canvas)', padding: '0.75rem 1.25rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
          <span>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="artist-breadcrumb-nav" aria-label="Breadcrumb">
        <Link href="/" className="artist-breadcrumb-link">Home</Link>
        <span className="artist-breadcrumb-sep">/</span>
        <Link href="/artist" className="artist-breadcrumb-link">Artists</Link>
        <span className="artist-breadcrumb-sep">/</span>
        <span className="artist-breadcrumb-current">@{artist.handle}</span>
      </nav>

      {/* 1. Artist Hero Section */}
      <section className="artist-hero-section" aria-label="Artist Profile Header">
        <div className="artist-hero-card">
          <div className="artist-avatar-container">
            <div className="artist-resident-ring" />
            <div className="artist-avatar-large">
              {artist.name.substring(0, 2).toUpperCase()}
            </div>
          </div>

          <div className="artist-meta-main">
            <div className="artist-handle-row">
              <h1 className="artist-name">{artist.name}</h1>
              <span className="artist-handle-tag">@{artist.handle}</span>
              <span className="artist-badge-verified">✓ Verified Resident</span>
            </div>

            <div className="artist-role-location">
              <span className="artist-role-badge">{artist.role}</span>
              <span className="artist-dot">•</span>
              <span>{artist.location}</span>
            </div>

            <p className="artist-bio">{artist.bio}</p>

            <div className="artist-collection-banner">
              <span className="artist-collection-label">COLLECTION:</span>
              <strong>{artist.collection}</strong>
            </div>
          </div>

          <div className="artist-actions-group">
            <button
              type="button"
              className={`btn-pill-primary ${isFollowing ? 'btn-pill-secondary' : ''}`}
              onClick={() => setIsFollowing((prev) => !prev)}
            >
              {isFollowing ? '✓ Following' : '+ Follow Artist'}
            </button>
            <Link
              href={`/contact?artist=${artist.handle}`}
              className="btn-pill-secondary btn-pill-sm"
              style={{ textAlign: 'center' }}
            >
              Curatorial Inquiry ↗
            </Link>
            <Link
              href="/studio/upload"
              className="btn-pill-secondary btn-pill-sm"
              style={{ textAlign: 'center' }}
            >
              Mint In Studio ↗
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Artist Stats Section */}
      <section className="artist-stats-section" aria-label="Artist Archive Statistics">
        <div className="artist-stats-grid">
          <div className="artist-stat-box">
            <span className="stat-value">{artistWorks.length}</span>
            <span className="stat-caption">Total Archive Works</span>
          </div>
          <div className="artist-stat-box">
            <span className="stat-value">{artistWorks.filter((w) => !w.isVault).length}</span>
            <span className="stat-caption">Public Stream Cels</span>
          </div>
          <div className="artist-stat-box">
            <span className="stat-value">{artist.editionsCount}</span>
            <span className="stat-caption">Editions Minted</span>
          </div>
          <div className="artist-stat-box">
            <span className="stat-value">{artistWorks.filter((w) => w.isVault).length}</span>
            <span className="stat-caption">Curated Works</span>
          </div>
        </div>
      </section>

      {/* 3. Portfolio Works Section */}
      <section className="artist-portfolio-section" aria-label="Portfolio Works">
        <div className="artist-portfolio-header">
          <h2 className="artist-portfolio-title">
            Published Works ({filteredWorks.length})
          </h2>

          <div className="artist-category-chips" role="tablist" aria-label="Filter works">
            {['All', 'Generative', 'Kinetic', 'Vectors', 'Mono', 'Vaults'].map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`category-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        {filteredWorks.length === 0 ? (
          <div className="artist-empty-portfolio-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px solid var(--border-subtle)', margin: '1.5rem 0' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>✦</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No Archive Cels Minted Yet</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This resident creator has not minted any public cels to the digital archive yet. Verified artists and illustrators can prepare and mint SVG masters in the Creator Studio.
            </p>
            <Link href="/studio/upload" className="btn-pill-primary btn-pill-lg">
              Mint Cel in Creator Studio ↗
            </Link>
          </div>
        ) : (
          <div className="artist-works-grid">
            {filteredWorks.map((work) => (
              <article
                key={work.id}
                className="artist-work-card"
                onClick={() => setActiveWork(work)}
                tabIndex={0}
                aria-label={`${work.code}: ${work.title}`}
              >
                <div className="artist-work-tile" style={{ backgroundColor: work.color }}>
                  {work.gifSrc && work.category === 'Kinetic' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={work.gifSrc} alt={work.title} loading="lazy" />
                  ) : (
                    <ArtworkCanvas
                      work={work}
                      className=""
                      watermarkLabel={work.artist}
                      patternPrefix="artist-grid"
                    />
                  )}

                  {work.isVault && (
                    <div className="artist-work-vault-badge">
                      <span>🔒</span>
                      <span>VAULT</span>
                    </div>
                  )}

                  <div className="artist-work-tile-overlay">
                    <span className="inspect-pill">Inspect Cel ↗</span>
                  </div>
                </div>

                <div className="artist-work-info">
                  <div className="artist-work-header-row">
                    <span className="artist-work-code">{work.code}</span>
                    <span className="artist-work-category">{work.category}</span>
                  </div>
                  <h3 className="artist-work-title">{work.title}</h3>
                  <div className="artist-work-bottom-row">
                    <span>{work.edition}</span>
                    <span style={{ fontWeight: 600 }}>{work.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. Lightbox Modal */}
      {activeWork && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onClick={() => setActiveWork(null)}
        >
          <div
            className="lightbox-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveWork(null)}
              aria-label="Close Inspection Modal"
            >
              &times;
            </button>

            {/* Visual Media Preview */}
            <div className="lightbox-preview-wrap" style={{ backgroundColor: activeWork.color }}>
              {activeWork.gifSrc && activeWork.category === 'Kinetic' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeWork.gifSrc} alt={activeWork.title} />
              ) : activeWork.svgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeWork.svgSrc} alt={activeWork.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <ArtworkCanvas
                  work={activeWork}
                  className=""
                  watermarkLabel={activeWork.artist}
                  patternPrefix="artist-grid"
                />
              )}
            </div>

            {/* Metadata & Downloads */}
            <div className="lightbox-details-wrap">
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  {activeWork.code} • {activeWork.category.toUpperCase()} ARCHIVE
                </span>
                <h3 id="lightbox-title" className="lightbox-title">{activeWork.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0.5rem 0 1rem' }}>
                  {activeWork.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '1rem', borderRadius: '14px', background: 'var(--bg-subtle)', marginBottom: '1.5rem', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>ARTIST:</span>
                    <div style={{ fontWeight: 600 }}>{activeWork.artist}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>EDITION:</span>
                    <div style={{ fontWeight: 600 }}>{activeWork.edition}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>ACCENT TONE:</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{activeWork.color}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>STATUS:</span>
                    <div style={{ fontWeight: 600, color: activeWork.isVault ? '#f43f5e' : '#10b981' }}>
                      {activeWork.isVault ? 'Curatorial Study' : 'Featured Cut'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Format Downloads */}
              <div>
                <div className="lightbox-downloads-title">EXPORT CEL FORMATS</div>
                <div className="lightbox-downloads-grid">
                  <button
                    type="button"
                    className="btn-download-format"
                    onClick={(e) => handleExport(activeWork, 'png', e)}
                  >
                    <span>PNG Preview</span>
                    <span style={{ fontSize: '10px', color: '#10b981' }}>FREE</span>
                  </button>
                  <button
                    type="button"
                    className="btn-download-format"
                    onClick={(e) => handleExport(activeWork, 'jpg', e)}
                  >
                    <span>JPG Preview</span>
                    <span style={{ fontSize: '10px', color: '#10b981' }}>FREE</span>
                  </button>
                  <button
                    type="button"
                    className="btn-download-format gated"
                    onClick={(e) => handleExport(activeWork, 'svg', e)}
                  >
                    <span>SVG Vector Master</span>
                    <span style={{ fontSize: '10px', color: 'var(--brand-primary)' }}>VAULT</span>
                  </button>
                  {activeWork.gifSrc && (
                    <button
                      type="button"
                      className="btn-download-format gated"
                      onClick={(e) => handleExport(activeWork, 'gif', e)}
                    >
                      <span>Kinetic GIF Loop</span>
                      <span style={{ fontSize: '10px', color: 'var(--brand-primary)' }}>VAULT</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
