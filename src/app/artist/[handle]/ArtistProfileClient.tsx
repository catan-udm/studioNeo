'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ALL_GALLERY_WORKS,
  RESIDENT_ARTISTS,
  GalleryWork,
  ResidentArtist,
  generateStandaloneSvg,
} from '../../gallery/galleryData';
import { getAuthenticatedSession } from '@/lib/clientAuthCache';
import './artistProfile.css';

interface ArtistProfileClientProps {
  handle: string;
}

function ArtworkCanvas({ work }: { work: GalleryWork }) {
  if (work.svgSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={work.svgSrc}
        alt={work.title}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        loading="lazy"
      />
    );
  }

  const isMono = work.category === 'Mono';
  const strokeColor = isMono ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)';
  const accentFill = isMono ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const gridStroke = isMono ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="400" fill={work.color} />
      <defs>
        <pattern id={`artist-grid-${work.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#artist-grid-${work.id})`} />

      {work.category === 'Generative' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="130" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="60" strokeDasharray="3 3" />
          <polygon points="200,85 295,245 105,245" strokeWidth="1.2" fill={accentFill} />
          <circle cx="200" cy="200" r="14" fill={strokeColor} />
        </g>
      )}

      {work.category === 'Kinetic' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.75">
          <path d="M 50 260 Q 200 60 350 260" strokeWidth="2" />
          <path d="M 50 220 Q 200 20 350 220" strokeWidth="1.2" strokeDasharray="5 3" />
          <circle cx="200" cy="160" r="50" fill={accentFill} />
          <circle cx="200" cy="160" r="6" fill={strokeColor} />
        </g>
      )}

      {work.category === 'Vectors' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.6">
          <polygon points="200,90 295,145 295,255 200,310 105,255 105,145" strokeWidth="2" />
          <line x1="200" y1="90" x2="200" y2="200" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="295" y2="255" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="105" y2="255" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="32" fill={accentFill} />
        </g>
      )}

      {work.category === 'Mono' && (
        <g stroke="#ffffff" fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="140" opacity="0.25" strokeDasharray="2 3" />
          <circle cx="200" cy="200" r="110" opacity="0.45" />
          <circle cx="200" cy="200" r="80" strokeWidth="2" />
          <circle cx="200" cy="200" r="18" fill="#ffffff" />
        </g>
      )}

      <text
        x="376"
        y="384"
        textAnchor="end"
        fill={strokeColor}
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
        opacity="0.8"
      >
        {work.code} • {work.artist}
      </text>
    </svg>
  );
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
  const [isSubscriber, setIsSubscriber] = useState(false);
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
        if (session.authenticated && session.subscriber) {
          const t = (session.subscriber.tier || '').toLowerCase();
          if (
            t === 'collector' ||
            t === 'studio' ||
            t === 'studio-alpha' ||
            t === 'studio-atelier' ||
            t === 'enterprise' ||
            t.startsWith('artist') ||
            t.startsWith('illustrator')
          ) {
            setIsSubscriber(true);
          }
        }
      }).catch(() => {});

      // Query DB for newly minted cels by this artist
      fetch(`/api/cels?artist=${cleanHandle}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.cels)) {
            const mapped: GalleryWork[] = data.cels.map((c: {
              id: number;
              code: string;
              title: string;
              artist: string;
              artist_handle: string;
              artist_avatar?: string;
              color: string;
              gif_url?: string | null;
              svg_url?: string | null;
              svg_storage_path?: string | null;
              likes?: number;
              edition: string;
              price: string;
              category: 'Generative' | 'Kinetic' | 'Vectors' | 'Mono';
              is_vault?: number;
              format?: string;
              description?: string;
            }) => ({
              id: `db-cel-${c.id}`,
              code: c.code,
              title: c.title,
              artist: c.artist,
              artistHandle: c.artist_handle,
              artistAvatar: c.artist_avatar || 'AT',
              color: c.color,
              gifSrc: c.gif_url || undefined,
              svgSrc: c.svg_url || (c.svg_storage_path ? `/api/assets/download/${c.code}?format=svg&preview=true` : undefined),
              likes: c.likes || 0,
              edition: c.edition,
              price: c.price,
              category: c.category,
              isVault: Boolean(c.is_vault),
              unlocked: true,
              format: (c.format as '4K' | 'SVG' | 'RAW' | 'VECTORS') || 'SVG',
              description: c.description || 'Verified studio cel.',
            }));
            setDynamicCels(mapped);
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

      // Rule 5: Viewing & standard web exports (PNG/JPG) are automatically free for all community visitors
      if (format === 'png' || format === 'jpg') {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        const renderToCanvas = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1200;
          canvas.height = 1200;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          if (format === 'jpg') {
            ctx.fillStyle = work.color;
            ctx.fillRect(0, 0, 1200, 1200);
          }
          ctx.drawImage(img, 0, 0, 1200, 1200);

          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          const ext = format === 'jpg' ? 'jpg' : 'png';

          canvas.toBlob((canvasBlob) => {
            if (canvasBlob) {
              const downloadUrl = URL.createObjectURL(canvasBlob);
              const a = document.createElement('a');
              a.href = downloadUrl;
              a.download = `studioNeo-${work.code}-preview.${ext}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(downloadUrl);
              showToast(`Exported free ${format.toUpperCase()} preview for #${work.code}`);
            }
          }, mimeType, 0.95);
        };

        if (work.svgSrc) {
          img.onload = renderToCanvas;
          img.src = work.svgSrc;
        } else {
          const svgContent = generateStandaloneSvg(work);
          const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          img.onload = () => {
            renderToCanvas();
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
        return;
      }

      // Rule 5: High-quality / original master assets (raw vector SVG, kinetic GIF) are locked behind subscriber vaults
      if ((work.isVault || format === 'svg' || format === 'gif') && !isSubscriber) {
        showToast(`Subscriber Vault: Subscribe to unlock lossless ${format.toUpperCase()} stem for #${work.code}.`);
        return;
      }

      if (format === 'gif') {
        if (work.gifSrc) {
          const a = document.createElement('a');
          a.href = work.gifSrc;
          a.download = `studioNeo-${work.code}-kinetic.gif`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          showToast(`Downloaded kinetic animated GIF for #${work.code}`);
        } else {
          showToast('Animated kinetic GIF is only available for kinetic motion works.');
        }
        return;
      }

      // SVG Master download
      if (work.svgSrc) {
        const a = document.createElement('a');
        a.href = `/api/assets/download/${work.code}?format=svg`;
        a.download = `studioNeo-${work.code}-master.svg`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Downloaded vector master stem for #${work.code} (${work.title})`);
        return;
      }

      const svgContent = generateStandaloneSvg(work);
      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studioNeo-${work.code}-master.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded vector master stem for #${work.code} (${work.title})`);
    },
    [isSubscriber, showToast]
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
        <Link href="/gallery" className="artist-breadcrumb-link">Gallery Archive</Link>
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
            <span className="stat-caption">Subscriber Vaults</span>
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
                    <ArtworkCanvas work={work} />
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
                <ArtworkCanvas work={activeWork} />
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
                      {activeWork.isVault ? 'Subscriber Vault' : 'Public Stream'}
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
