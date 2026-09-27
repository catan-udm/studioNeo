'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ALL_GALLERY_WORKS, GalleryWork } from '../gallery/galleryData';
import './collection.css';

/**
 * Geometric Vector Artwork Cel Generator
 */
function ArtworkCanvas({ work }: { work: GalleryWork }) {
  const isMono = work.category === 'Mono';
  const strokeColor = isMono ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)';
  const accentFill = isMono ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const gridStroke = isMono ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <svg
      className="collection-artwork-svg"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="400" fill={work.color} />
      <defs>
        <pattern id={`cgrid-${work.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#cgrid-${work.id})`} />

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
          <rect x="175" y="135" width="50" height="50" transform="rotate(45 200 160)" strokeWidth="1.5" />
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
        {work.code} • studioNeo
      </text>
    </svg>
  );
}

export default function CollectionPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'commercial'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [checkoutWork, setCheckoutWork] = useState<GalleryWork | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const storedSaved = localStorage.getItem('studioNeo_saved_works');
      if (storedSaved) {
        setSavedIds(JSON.parse(storedSaved));
      } else {
        // Provide sample starter saved items for immediate delight if empty
        const initialSaved = ['work-1', 'work-4', 'work-7'];
        setSavedIds(initialSaved);
        localStorage.setItem('studioNeo_saved_works', JSON.stringify(initialSaved));
      }

      const storedLiked = localStorage.getItem('studioNeo_liked_works');
      if (storedLiked) {
        setLikedIds(JSON.parse(storedLiked));
      }
    } catch {
      // Fallback
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3200);
  }, []);

  // Remove work from saved collection
  const removeSavedWork = (workId: string, workCode: string) => {
    const updated = savedIds.filter((id) => id !== workId);
    setSavedIds(updated);
    try {
      localStorage.setItem('studioNeo_saved_works', JSON.stringify(updated));
    } catch {
      // Storage error
    }
    showToast(`Removed #${workCode} from saved collection.`);
  };

  // Toggle Like (Heart)
  const toggleLike = (workId: string) => {
    let updated: string[];
    if (likedIds.includes(workId)) {
      updated = likedIds.filter((id) => id !== workId);
    } else {
      updated = [...likedIds, workId];
    }
    setLikedIds(updated);
    try {
      localStorage.setItem('studioNeo_liked_works', JSON.stringify(updated));
    } catch {
      // Storage error
    }
  };

  // Clear all saved
  const handleClearCollection = () => {
    if (confirm('Clear all saved vector cels from your local collection?')) {
      setSavedIds([]);
      try {
        localStorage.removeItem('studioNeo_saved_works');
      } catch {
        // Storage error
      }
      showToast('Collection cleared.');
    }
  };

  // Export collection JSON manifest
  const handleExportManifest = () => {
    const collectedItems = ALL_GALLERY_WORKS.filter((w) => savedIds.includes(w.id));
    const manifest = {
      archive: 'studioNeo Collector Vault',
      exportedAt: new Date().toISOString(),
      totalPieces: collectedItems.length,
      provenanceHash: 'SHA-256-' + Math.random().toString(36).substring(2, 12),
      items: collectedItems.map((w) => ({
        id: w.id,
        code: w.code,
        title: w.title,
        artist: w.artist,
        category: w.category,
        edition: w.edition,
        price: w.price,
      })),
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studioNeo-collection-manifest.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported collection manifest JSON.');
  };

  // Download single master cel
  const handleDownloadCel = (work: GalleryWork) => {
    const strokeColor = work.category === 'Mono' ? '#ffffff' : 'rgba(0, 0, 0, 0.6)';
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1200" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${work.color}"/>
  <g stroke="${strokeColor}" fill="none" stroke-width="2">
    <circle cx="200" cy="200" r="130"/>
    <circle cx="200" cy="200" r="85" stroke-dasharray="6 4"/>
    <line x1="50" y1="200" x2="350" y2="200" stroke-width="1"/>
    <line x1="200" y1="50" x2="200" y2="350" stroke-width="1"/>
    <circle cx="200" cy="200" r="14" fill="${strokeColor}"/>
  </g>
  <text x="375" y="380" text-anchor="end" fill="${strokeColor}" font-size="11" font-family="monospace">
    ${work.code} • studioNeo Digital Archive • Edition ${work.edition}
  </text>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studioNeo-${work.code}-master.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded master vector cel for #${work.code}`);
  };

  // Filtered list
  const collectionWorks = useMemo(() => {
    const allSaved = ALL_GALLERY_WORKS.filter((w) => savedIds.includes(w.id));
    if (activeTab === 'favorites') {
      return allSaved.filter((w) => likedIds.includes(w.id));
    }
    if (activeTab === 'commercial') {
      return allSaved.filter((w) => !w.isVault);
    }
    return allSaved;
  }, [savedIds, likedIds, activeTab]);

  // Total valuation calculation
  const totalValuation = useMemo(() => {
    return collectionWorks.reduce((acc, work) => {
      const num = parseInt(work.price.replace(/[^0-9]/g, '')) || 0;
      return acc + num;
    }, 0);
  }, [collectionWorks]);

  // Unique artists count
  const artistsCount = useMemo(() => {
    const set = new Set(collectionWorks.map((w) => w.artist));
    return set.size;
  }, [collectionWorks]);

  if (!isClient) {
    return <main className="collection-page" />;
  }

  return (
    <main className="collection-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="collection-toast" role="status" aria-live="polite">
          <span>✦ {toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <section className="collection-hero">
        <span className="collection-overline">PERSONAL CURATION &bull; ARCHIVE VAULT</span>
        <h1 className="collection-title">Saved Collection</h1>
        <p className="collection-lead">
          Your curated selection of algorithmic kinetic motion cels, vector stems, and resident artist editions.
        </p>

        {/* 2. Collection Metrics Bar */}
        <div className="collection-metrics-bar">
          <div className="collection-metric-card">
            <span className="metric-num">{collectionWorks.length}</span>
            <span className="metric-label">Saved Works</span>
          </div>
          <div className="collection-metric-card">
            <span className="metric-num">${totalValuation}</span>
            <span className="metric-label">Est. Vault Value</span>
          </div>
          <div className="collection-metric-card">
            <span className="metric-num">{artistsCount}</span>
            <span className="metric-label">Resident Artists</span>
          </div>
        </div>
      </section>

      {/* 3. Toolbar & Actions */}
      <section className="collection-toolbar">
        <div className="collection-tabs" role="tablist">
          <button
            type="button"
            className={`collection-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Saved ({savedIds.length})
          </button>
          <button
            type="button"
            className={`collection-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            ♥ Favorites ({savedIds.filter((id) => likedIds.includes(id)).length})
          </button>
          <button
            type="button"
            className={`collection-tab-btn ${activeTab === 'commercial' ? 'active' : ''}`}
            onClick={() => setActiveTab('commercial')}
          >
            Public Cels
          </button>
        </div>

        <div className="collection-actions-group">
          <button
            type="button"
            onClick={handleExportManifest}
            className="btn-pill-secondary btn-pill-sm"
            disabled={collectionWorks.length === 0}
          >
            Export Manifest (JSON)
          </button>
          {savedIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearCollection}
              className="btn-pill-secondary btn-pill-sm"
            >
              Clear
            </button>
          )}
          <Link href="/gallery" className="btn-pill-primary btn-pill-sm">
            + Explore Gallery
          </Link>
        </div>
      </section>

      {/* 4. Main Cards Grid or Empty State */}
      <section className="collection-grid-container">
        {collectionWorks.length === 0 ? (
          <div className="collection-empty-card">
            <div className="empty-icon-wrap">✦</div>
            <h2 className="empty-title">Your Collection is Empty</h2>
            <p className="empty-desc">
              Browse our curated gallery archive and click the bookmark or heart icon on any kinetic cel to
              assemble your personalized collection.
            </p>
            <Link href="/gallery" className="btn-pill-primary">
              Explore Gallery Archive
            </Link>
          </div>
        ) : (
          <div className="collection-cards-grid">
            {collectionWorks.map((work) => {
              const isLiked = likedIds.includes(work.id);

              return (
                <article key={work.id} className="collection-card">
                  {/* Card Header */}
                  <div className="collection-card-header">
                    <div className="collection-card-author">
                      <div className="collection-avatar-ring">
                        <div className="collection-avatar-initials">
                          {work.artist.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="collection-author-meta">
                        <span className="collection-author-handle">@{work.artistHandle}</span>
                        <span className="collection-item-tag">#{work.code} &bull; {work.category}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="collection-remove-btn"
                      onClick={() => removeSavedWork(work.id, work.code)}
                      title="Remove from saved collection"
                      aria-label={`Remove ${work.title} from collection`}
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1:1 Aspect Ratio Artwork Media */}
                  <div
                    className="collection-card-media"
                    style={{ backgroundColor: work.color }}
                    onClick={() => handleDownloadCel(work)}
                    title="Click to download vector stem"
                  >
                    <ArtworkCanvas work={work} />
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="collection-card-actions">
                    <div className="collection-actions-left">
                      {/* Heart Toggle */}
                      <button
                        type="button"
                        className={`collection-icon-btn ${isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(work.id)}
                        aria-label="Toggle favourite"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={isLiked ? '#e0245e' : 'none'}
                          stroke={isLiked ? '#e0245e' : 'currentColor'}
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {/* Shopping Bag Buy */}
                      <button
                        type="button"
                        className="collection-icon-btn"
                        onClick={() => setCheckoutWork(work)}
                        aria-label={`Acquire ${work.title}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </button>

                      {/* Download Master Stem */}
                      <button
                        type="button"
                        className="collection-icon-btn"
                        onClick={() => handleDownloadCel(work)}
                        aria-label={`Download vector stem for ${work.title}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>

                    <span className="collection-price-tag">{work.price}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Acquisition Modal */}
      {checkoutWork && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setCheckoutWork(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="gallery-modal-content ig-checkout-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', background: '#fff', borderRadius: '20px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>Acquire #{checkoutWork.code}</h2>
              <button
                type="button"
                onClick={() => setCheckoutWork(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6, marginBottom: '20px' }}>
              Confirming registration for <strong>{checkoutWork.title}</strong> by {checkoutWork.artist} ({checkoutWork.price}). Includes uncompressed SVG stems and provenance token.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-pill-primary"
                onClick={() => {
                  showToast(`Purchase order registered for #${checkoutWork.code}!`);
                  setCheckoutWork(null);
                }}
              >
                Confirm Acquisition — {checkoutWork.price}
              </button>
              <button
                type="button"
                className="btn-pill-secondary"
                onClick={() => setCheckoutWork(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <footer className="collection-footer">
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
          <span>&copy; 2026 studioNeo Archive. All curation rights preserved.</span>
          <span>bikko.studio visual engineering</span>
        </div>
      </footer>
    </main>
  );
}
