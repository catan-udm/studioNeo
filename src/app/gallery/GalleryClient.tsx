'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ALL_GALLERY_WORKS,
  RESIDENT_ARTISTS,
  GalleryWork,
  ResidentArtist,
} from './galleryData';
import './gallery.css';

type CategoryFilter = 'All' | 'Generative' | 'Kinetic' | 'Vectors' | 'Mono' | 'Vaults';
type SortOption = 'recent' | 'likes' | 'price-desc' | 'price-asc';
type ViewMode = 'curated' | 'grid';

/**
 * Geometric Vector Artwork Cel Generator
 * Creates an authentic minimalist studio cel inside each card's 1:1 media container
 */
function ArtworkCanvas({ work }: { work: GalleryWork }) {
  const isMono = work.category === 'Mono';
  const strokeColor = isMono ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)';
  const accentFill = isMono ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const gridStroke = isMono ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <svg
      className="ig-artwork-svg"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="400" height="400" fill={work.color} />

      {/* Subtle blueprint grid pattern */}
      <defs>
        <pattern id={`grid-${work.id}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill={`url(#grid-${work.id})`} />

      {/* Parametric Generative Design */}
      {work.category === 'Generative' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="130" strokeDasharray="6 4" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="60" strokeDasharray="3 3" />
          <line x1="50" y1="200" x2="350" y2="200" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="200" y1="50" x2="200" y2="350" strokeWidth="0.8" strokeDasharray="2 4" />
          <polygon points="200,85 295,245 105,245" strokeWidth="1.2" fill={accentFill} />
          <circle cx="200" cy="200" r="14" fill={strokeColor} />
          <circle cx="200" cy="85" r="4" fill={strokeColor} />
          <circle cx="295" cy="245" r="4" fill={strokeColor} />
          <circle cx="105" cy="245" r="4" fill={strokeColor} />
        </g>
      )}

      {/* Kinetic Wave / Harmonic Oscillation */}
      {work.category === 'Kinetic' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.75">
          <path d="M 50 260 Q 200 60 350 260" strokeWidth="2" />
          <path d="M 50 220 Q 200 20 350 220" strokeWidth="1.2" strokeDasharray="5 3" />
          <path d="M 50 300 Q 200 100 350 300" strokeWidth="1" opacity="0.7" />
          <circle cx="200" cy="160" r="50" fill={accentFill} />
          <line x1="70" y1="70" x2="330" y2="330" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="175" y="135" width="50" height="50" transform="rotate(45 200 160)" strokeWidth="1.5" />
          <circle cx="200" cy="160" r="6" fill={strokeColor} />
        </g>
      )}

      {/* Vector Lattice / Isometric Geometry */}
      {work.category === 'Vectors' && (
        <g stroke={strokeColor} fill="none" strokeWidth="1.6">
          <polygon points="200,90 295,145 295,255 200,310 105,255 105,145" strokeWidth="2" />
          <line x1="200" y1="90" x2="200" y2="200" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="295" y2="255" strokeWidth="1.5" />
          <line x1="200" y1="200" x2="105" y2="255" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="32" fill={accentFill} />
          <circle cx="200" cy="90" r="5" fill={strokeColor} />
          <circle cx="295" cy="145" r="5" fill={strokeColor} />
          <circle cx="295" cy="255" r="5" fill={strokeColor} />
          <circle cx="200" cy="310" r="5" fill={strokeColor} />
          <circle cx="105" cy="255" r="5" fill={strokeColor} />
          <circle cx="105" cy="145" r="5" fill={strokeColor} />
        </g>
      )}

      {/* Mono Topography / Concentric Radials */}
      {work.category === 'Mono' && (
        <g stroke="#ffffff" fill="none" strokeWidth="1.5">
          <circle cx="200" cy="200" r="140" opacity="0.25" strokeDasharray="2 3" />
          <circle cx="200" cy="200" r="110" opacity="0.45" />
          <circle cx="200" cy="200" r="80" strokeWidth="2" />
          <circle cx="200" cy="200" r="50" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="18" fill="#ffffff" />
          <line x1="40" y1="200" x2="360" y2="200" strokeWidth="0.8" opacity="0.35" />
          <line x1="200" y1="40" x2="200" y2="360" strokeWidth="0.8" opacity="0.35" />
        </g>
      )}

      {/* Micro Studio Watermark */}
      <text
        x="376"
        y="384"
        textAnchor="end"
        fill={strokeColor}
        fontSize="10"
        fontFamily="monospace"
        fontWeight="600"
        opacity="0.8"
        letterSpacing="0.08em"
      >
        {work.code} • studioNeo
      </text>
    </svg>
  );
}

export default function GalleryClient() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('artist-1');
  const [residentIndex, setResidentIndex] = useState<number>(0);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('curated');
  const [visibleCount, setVisibleCount] = useState<number>(24);
  const [activeWork, setActiveWork] = useState<GalleryWork | null>(null);
  const [checkoutWork, setCheckoutWork] = useState<GalleryWork | null>(null);
  const [likedWorkIds, setLikedWorkIds] = useState<Set<string>>(new Set());
  const [savedWorkIds, setSavedWorkIds] = useState<Set<string>>(new Set());
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [burstHeartId, setBurstHeartId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with localStorage on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedSaved = localStorage.getItem('studioNeo_saved_works');
        if (storedSaved) {
          setSavedWorkIds(new Set(JSON.parse(storedSaved)));
        }
        const storedLiked = localStorage.getItem('studioNeo_liked_works');
        if (storedLiked) {
          setLikedWorkIds(new Set(JSON.parse(storedLiked)));
        }
      } catch {
        // Storage unavailable
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Persist likes changes
  useEffect(() => {
    try {
      localStorage.setItem('studioNeo_liked_works', JSON.stringify(Array.from(likedWorkIds)));
    } catch {}
  }, [likedWorkIds]);

  // Persist saves changes
  useEffect(() => {
    try {
      localStorage.setItem('studioNeo_saved_works', JSON.stringify(Array.from(savedWorkIds)));
    } catch {}
  }, [savedWorkIds]);

  // Active resident artist
  const currentResident: ResidentArtist = RESIDENT_ARTISTS[residentIndex] || RESIDENT_ARTISTS[0];

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: ALL_GALLERY_WORKS.length,
      Generative: ALL_GALLERY_WORKS.filter((w) => w.category === 'Generative' && !w.isVault).length,
      Kinetic: ALL_GALLERY_WORKS.filter((w) => w.category === 'Kinetic' && !w.isVault).length,
      Vectors: ALL_GALLERY_WORKS.filter((w) => w.category === 'Vectors' && !w.isVault).length,
      Mono: ALL_GALLERY_WORKS.filter((w) => w.category === 'Mono' && !w.isVault).length,
      Vaults: ALL_GALLERY_WORKS.filter((w) => w.isVault).length,
    };
  }, []);

  // Filtered and sorted works
  const filteredWorks = useMemo(() => {
    let result = [...ALL_GALLERY_WORKS];

    // Filter by category
    if (selectedCategory === 'Vaults') {
      result = result.filter((w) => w.isVault);
    } else if (selectedCategory !== 'All') {
      result = result.filter((w) => w.category === selectedCategory && !w.isVault);
    }

    // Filter by artist if specific artist selected
    if (selectedArtistId !== 'all') {
      const artist = RESIDENT_ARTISTS.find((a) => a.id === selectedArtistId);
      if (artist) {
        result = result.filter((w) => w.artist === artist.name);
      }
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'likes') {
        const aLikes = a.likes + (likedWorkIds.has(a.id) ? 1 : 0);
        const bLikes = b.likes + (likedWorkIds.has(b.id) ? 1 : 0);
        return bLikes - aLikes;
      }
      if (sortOption === 'price-desc') {
        const parsePrice = (p: string) => parseInt(p.replace(/[^0-9]/g, '')) || 0;
        return parsePrice(b.price) - parsePrice(a.price);
      }
      if (sortOption === 'price-asc') {
        const parsePrice = (p: string) => parseInt(p.replace(/[^0-9]/g, '')) || 0;
        return parsePrice(a.price) - parsePrice(b.price);
      }
      return 0;
    });

    return result;
  }, [selectedCategory, selectedArtistId, sortOption, likedWorkIds]);

  // Pagination slice
  const displayedWorks = useMemo(() => {
    return filteredWorks.slice(0, visibleCount);
  }, [filteredWorks, visibleCount]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Toggle Like (Favourite Heart)
  const toggleLike = useCallback((workId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(workId)) {
        next.delete(workId);
      } else {
        next.add(workId);
      }
      return next;
    });
  }, []);

  // Double click on media for Instagram-style heart burst
  const handleMediaDoubleClick = useCallback((work: GalleryWork) => {
    if (!likedWorkIds.has(work.id)) {
      setLikedWorkIds((prev) => new Set(prev).add(work.id));
    }
    setBurstHeartId(work.id);
    setTimeout(() => setBurstHeartId(null), 850);
  }, [likedWorkIds]);

  // Toggle Save / Bookmark
  const toggleSave = useCallback((work: GalleryWork, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedWorkIds((prev) => {
      const next = new Set(prev);
      const isSaved = next.has(work.id);
      if (isSaved) {
        next.delete(work.id);
        showToast(`Removed #${work.code} from saved collection`);
      } else {
        next.add(work.id);
        showToast(`Saved #${work.code} to your archive collection`);
      }
      return next;
    });
  }, [showToast]);

  // Handle Buy Click (Shopping Bag)
  const handleBuyClick = useCallback((work: GalleryWork, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckoutWork(work);
  }, []);

  // Handle Download Click (Saving/Exporting Master)
  const handleDownloadClick = useCallback((work: GalleryWork, e: React.MouseEvent) => {
    e.stopPropagation();
    if (work.isVault) {
      showToast(`Subscriber Vault: Subscribe to unlock lossless SVG stem for #${work.code}.`);
      return;
    }

    // Generate downloadable SVG Cel
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

    showToast(`Downloaded vector master stem for #${work.code} (${work.title})`);
  }, [showToast]);

  // Switch resident artist
  const nextResident = () => {
    setResidentIndex((prev) => (prev + 1) % RESIDENT_ARTISTS.length);
  };

  const prevResident = () => {
    setResidentIndex((prev) => (prev - 1 + RESIDENT_ARTISTS.length) % RESIDENT_ARTISTS.length);
  };

  // Keyboard navigation & escape listener for modals
  useEffect(() => {
    if (!activeWork && !checkoutWork) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveWork(null);
        setCheckoutWork(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeWork, checkoutWork]);


  return (
    <main id="main-content" className="gallery-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="ig-toast" role="status" aria-live="polite">
          <span className="ig-toast-icon">✦</span>
          <span className="ig-toast-text">{toastMessage}</span>
        </div>
      )}

      {/* 1. Guest Preview / Mode Notification Bar */}
      <section className="gallery-notice-bar" aria-label="Archive notification">
        <div className="gallery-notice-inner">
          <div className="gallery-notice-text">
            <span className="gallery-notice-icon">🔓</span>
            <span>
              Guest Preview: Viewing public stream items. Subscribe to unlock full vector masters, SVG stems, and subscriber vaults.
            </span>
          </div>
          <div className="gallery-notice-actions">
            <Link href="/collection" className="btn-pill-secondary btn-pill-sm" title="Saved Collection" aria-label="Saved Collection">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
              <span className="notice-btn-desktop-text">Saved Collection {savedWorkIds.size > 0 ? `(${savedWorkIds.size})` : ''}</span>
              <span className="notice-btn-mobile-text">Saved {savedWorkIds.size > 0 ? `(${savedWorkIds.size})` : ''}</span>
            </Link>
            <Link href="/membership" className="btn-pill-primary btn-pill-sm" title="Subscribe to Bikko Studio" aria-label="Subscribe">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="notice-btn-desktop-text">Subscribe — $12/mo</span>
              <span className="notice-btn-mobile-text">$12/mo</span>
            </Link>
            <Link href="/login" className="btn-pill-secondary btn-pill-sm" title="Sign In" aria-label="Sign In">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Core Header & Typography */}
      <section className="gallery-header-section">
        <div className="gallery-core-header">
          <span className="gallery-overline">
            CATALOG INDEX <time dateTime="2023">2023</time>&mdash;<time dateTime="2025">2025</time>
          </span>
          <h1 className="gallery-primary-heading">
            Gallery Archive
            <span className="gallery-heading-count">(128 works)</span>
          </h1>
          <p className="gallery-description">
            Algorithmic media studies and curated digital cels across the studioNeo collective. Non-subscriber preview displaying unlocked public works.
          </p>
        </div>

        {/* Controls / Metadata Filter Bar */}
        <div className="gallery-meta-bar">
          <div className="gallery-meta-left">
            <label htmlFor="artist-select" className="gallery-artist-select-label">
              ARTIST:
            </label>
            <select
              id="artist-select"
              value={selectedArtistId}
              onChange={(e) => {
                setSelectedArtistId(e.target.value);
                const idx = RESIDENT_ARTISTS.findIndex((a) => a.id === e.target.value);
                if (idx !== -1) setResidentIndex(idx);
              }}
              className="gallery-select-input"
            >
              <option value="all">All Resident Artists</option>
              {RESIDENT_ARTISTS.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div className="gallery-meta-right">
            <div className="view-mode-toggle" role="group" aria-label="View layout switcher">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'curated' ? 'active' : ''}`}
                onClick={() => setViewMode('curated')}
                title="Curated 3-Column Editorial Grid"
                aria-label="Curated 3-Column Editorial Grid"
              >
                <span className="view-mode-btn-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="18" rx="1.5" />
                    <rect x="14" y="3" width="7" height="18" rx="1.5" />
                  </svg>
                </span>
                <span className="view-mode-btn-text">
                  <span className="view-mode-desktop">Curated (3-Col)</span>
                  <span className="view-mode-tablet">Editorial (2-Col)</span>
                  <span className="view-mode-mobile">Stream (1-Col)</span>
                </span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Mosaic Multi-Column Grid"
                aria-label="Mosaic Multi-Column Grid"
              >
                <span className="view-mode-btn-icon" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </span>
                <span className="view-mode-btn-text">
                  <span className="view-mode-desktop">Feed (4-Col)</span>
                  <span className="view-mode-tablet">Mosaic (3-Col)</span>
                  <span className="view-mode-mobile">Grid (2-Col)</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Featured Resident Artist Information Card */}
        <section className="gallery-artist-card" aria-label="Featured artist profile">
          <div className="gallery-artist-left">
            <div className="gallery-artist-avatar">
              {currentResident.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="gallery-artist-details">
              <div className="gallery-artist-title-row">
                <h2 className="gallery-artist-name">{currentResident.name}</h2>
                <span className="gallery-artist-role">{currentResident.role}</span>
                <span className="gallery-artist-divider">•</span>
                <span className="gallery-artist-location">{currentResident.location}</span>
              </div>
              <p className="gallery-artist-bio">{currentResident.bio}</p>
            </div>
          </div>

          <div className="gallery-artist-right">
            <div className="gallery-artist-stats">
              <div className="artist-stat-item">
                <span className="stat-number">{currentResident.archivedWorksCount}</span>
                <span className="stat-label">
                  Archived Works ({currentResident.publicWorksCount} Public)
                </span>
              </div>
              <div className="artist-stat-item">
                <span className="stat-number">{currentResident.editionsCount}</span>
                <span className="stat-label">Total Editions</span>
              </div>
            </div>

            <div className="gallery-artist-actions">
              <button
                type="button"
                className={`btn-pill-primary ${isFollowing ? 'btn-pill-secondary' : ''}`}
                onClick={() => setIsFollowing((prev) => !prev)}
              >
                {isFollowing ? '✓ Following' : '+ Follow Artist'}
              </button>

              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={prevResident}
                aria-label="Previous Resident Artist"
                title="Previous Resident Artist"
              >
                ‹
              </button>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-sm"
                onClick={nextResident}
                aria-label="Next Resident Artist"
                title="Next Resident Artist"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        {/* 4. Filter & Sorting Bar */}
        <div className="gallery-filter-bar">
          <div className="gallery-category-chips" role="tablist" aria-label="Filter works by category">
            {(['All', 'Generative', 'Kinetic', 'Vectors', 'Mono', 'Vaults'] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`category-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(24);
                }}
              >
                <span>{cat}</span>
                <span className="category-chip-count">({categoryCounts[cat]})</span>
              </button>
            ))}
          </div>

          <div className="gallery-count-sort">
            <span className="works-count-text">
              Showing 1–{displayedWorks.length} of {filteredWorks.length}
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="works-sort-select"
              aria-label="Sort works"
            >
              <option value="recent">Sorted by: Recent</option>
              <option value="likes">Sorted by: Likes</option>
              <option value="price-desc">Sorted by: Price (High-Low)</option>
              <option value="price-asc">Sorted by: Price (Low-High)</option>
            </select>
          </div>
        </div>

        {/* 5. Minimalist Instagram Cards Grid (Spacious, Uncompressed, Generous Gaps) */}
        <div className="gallery-grid-wrap">
          <div className={`gallery-cards-grid ${viewMode === 'curated' ? 'curated-grid' : 'feed-grid'}`} role="region" aria-label="Works Grid">
            {displayedWorks.map((work) => {
              const isLiked = likedWorkIds.has(work.id);
              const isSaved = savedWorkIds.has(work.id);
              const likesCount = work.likes + (isLiked ? 1 : 0);
              const isBursting = burstHeartId === work.id;

              return (
                <article
                  key={work.id}
                  className="ig-card"
                  tabIndex={0}
                  aria-label={`${work.code}: ${work.title}`}
                >
                  {/* Card Header (Avatar, Username, Category, More Options) */}
                  <div className="ig-card-header">
                    <div className="ig-author-profile">
                      <div className="ig-avatar-ring">
                        <span className="ig-avatar-initials">{work.artistAvatar}</span>
                      </div>
                      <div className="ig-author-meta">
                        <div className="ig-author-handle-row">
                          <span className="ig-author-handle">{work.artistHandle}</span>
                        </div>
                        <span className="ig-card-location">{work.category} Archive</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ig-dots-btn"
                      onClick={() => setActiveWork(work)}
                      aria-label="Work details"
                      title="View full specs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="2.2" />
                        <circle cx="19" cy="12" r="2.2" />
                        <circle cx="5" cy="12" r="2.2" />
                      </svg>
                    </button>
                  </div>

                  {/* Media Tile (1:1 Aspect Ratio with Geometric Vector Cel) */}
                  <div
                    className={`ig-media-tile ${work.isVault ? 'vault-tile' : ''}`}
                    onDoubleClick={() => handleMediaDoubleClick(work)}
                    onClick={() => setActiveWork(work)}
                    title="Double-click to favourite • Click for details"
                  >
                    <ArtworkCanvas work={work} />

                    {/* Instagram Double-Click Floating Heart Burst */}
                    {isBursting && (
                      <div className="ig-heart-burst-wrap" aria-hidden="true">
                        <svg className="ig-heart-burst" viewBox="0 0 24 24" fill="#ffffff" stroke="none">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </div>
                    )}

                    {/* Subscriber Vault Locked Overlay */}
                    {work.isVault && (
                      <div className="vault-overlay-content">
                        <div className="vault-lock-badge">
                          <span className="vault-lock-icon">🔒</span>
                          <span className="vault-label">SUBSCRIBER VAULT</span>
                        </div>
                        <span className="vault-status">Members Only Cel</span>
                      </div>
                    )}

                    {/* Subtle Hover Pill */}
                    <div className="ig-media-hover-overlay">
                      <span className="ig-inspect-pill">Inspect Cel ↗</span>
                    </div>
                  </div>

                  {/* Action Bar: Favourite (Heart), Shopping (Buy), Download (Saving), Bookmark */}
                  <div className="ig-action-bar">
                    <div className="ig-action-group-left">
                      {/* 1. Favourite as Heart */}
                      <button
                        type="button"
                        className={`ig-action-btn ig-heart-btn ${isLiked ? 'is-liked' : ''}`}
                        onClick={(e) => toggleLike(work.id, e)}
                        aria-label={isLiked ? 'Unlike work' : 'Favourite work'}
                        title={isLiked ? 'Unlike' : 'Favourite'}
                      >
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill={isLiked ? '#ef4444' : 'none'}
                          stroke={isLiked ? '#ef4444' : 'currentColor'}
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {/* 2. Shopping Icon for Buy */}
                      <button
                        type="button"
                        className="ig-action-btn ig-shop-btn"
                        onClick={(e) => handleBuyClick(work, e)}
                        aria-label={`Buy ${work.code} edition`}
                        title={`Buy edition (${work.price})`}
                      >
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </button>

                      {/* 3. Download Icon for Saving */}
                      <button
                        type="button"
                        className="ig-action-btn ig-download-btn"
                        onClick={(e) => handleDownloadClick(work, e)}
                        aria-label={`Download master for ${work.code}`}
                        title="Download / Save Vector Cel"
                      >
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </div>

                    <div className="ig-action-group-right">
                      {/* Bookmark / Save to Collection */}
                      <button
                        type="button"
                        className={`ig-action-btn ig-bookmark-btn ${isSaved ? 'is-saved' : ''}`}
                        onClick={(e) => toggleSave(work, e)}
                        aria-label={isSaved ? 'Remove from saved' : 'Save to collection'}
                        title={isSaved ? 'Saved to collection' : 'Save to collection'}
                      >
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill={isSaved ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card Content (Likes, Price, Caption, Metadata Pills, Date) */}
                  <div className="ig-card-content">
                    <div className="ig-likes-row">
                      <span className="ig-likes-count">
                        <strong>{likesCount.toLocaleString()}</strong> likes
                      </span>
                      <span className="ig-price-tag">{work.price}</span>
                    </div>

                    <div className="ig-caption-block">
                      <span className="ig-caption-author">{work.artistHandle}</span>{' '}
                      <span className="ig-caption-title">{work.title}</span> —{' '}
                      <span className="ig-caption-text">{work.description}</span>
                    </div>

                    <div className="ig-timestamp-row">
                      <span>CATALOG #{work.code}</span>
                      <span className="ig-timestamp-divider">•</span>
                      <span>{work.edition}</span>
                      <span className="ig-timestamp-divider">•</span>
                      <span>{work.format}</span>
                      {work.isVault && (
                        <>
                          <span className="ig-timestamp-divider">•</span>
                          <span className="ig-vault-text">VAULT</span>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* 6. Pagination & Load More */}
        <section className="gallery-pagination-section">
          {visibleCount < filteredWorks.length ? (
            <>
              <p className="pagination-status-text">
                Showing {displayedWorks.length} of {filteredWorks.length} works
              </p>
              <button
                type="button"
                className="btn-pill-secondary btn-pill-lg"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredWorks.length))}
              >
                Load More (+24 Works)
              </button>
            </>
          ) : (
            <p className="gallery-all-loaded-rule">
              — ALL {filteredWorks.length} ARCHIVED WORKS LOADED —
            </p>
          )}
        </section>

        {/* 7. Unlock Complete 128-Work Archive Section */}
        <section className="gallery-unlock-section" aria-labelledby="unlock-title">
          <div className="unlock-key-icon-wrap" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9m-4.5 4.5a6 6 0 1 0 8.5 8.5 6 6 0 0 0-8.5-8.5z" />
            </svg>
          </div>

          <h2 id="unlock-title" className="unlock-title">
            Unlock the Complete 128-Work Archive
          </h2>
          <p className="unlock-description">
            Get full access to high-fidelity vector masters, SVG stems, lossless cel prints, and direct artist commissions across the studioNeo collective.
          </p>

          <div className="unlock-features-grid">
            <div className="unlock-feature-card">
              <span className="feature-check-icon">✓</span>
              <h3>Lossless 4K &amp; SVG Downloads</h3>
              <p>Unlimited uncompressed vector downloads and source asset stems for design and kinetic exploration.</p>
            </div>

            <div className="unlock-feature-card">
              <span className="feature-check-icon">✓</span>
              <h3>Exclusive Edition Presales</h3>
              <p>48-hour priority access on limited physical prints, acrylic cels, and experimental editions.</p>
            </div>

            <div className="unlock-feature-card">
              <span className="feature-check-icon">✓</span>
              <h3>Passkey Passwordless Access</h3>
              <p>Instant biometric cryptographic sign-in across any device via Touch ID, Windows Hello, or FIDO2 keys.</p>
            </div>
          </div>

          <div className="unlock-actions-row">
            <Link href="/membership" className="btn-pill-primary btn-pill-lg">
              Become a Subscriber ($12/month)
            </Link>
            <Link href="/login" className="btn-pill-secondary btn-pill-lg">
              Already a subscriber? Sign in
            </Link>
          </div>
        </section>

        {/* 8. Minimalist Heritage Lab Footer */}
        <footer className="gallery-archive-footer">
          <div className="footer-top-row">
            <div className="footer-brand-block">
              <h2>studioNeo DIGITAL HERITAGE LAB</h2>
              <p>Kinetic artifice, architectural minimalism, and preserved animation cels.</p>
            </div>
            <div className="footer-coordinates">
              35.6764° N, 139.6500° E TOKYO / DISTRIBUTED
            </div>
          </div>

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
            <span>&copy; <time dateTime="2026">2026</time> studioNeo Archive. All curation rights preserved.</span>
            <span>bikko.studio visual engineering</span>
          </div>
        </footer>
      </section>

      {/* 9. Buy / Collect Modal (Triggered by Shopping Icon) */}
      {checkoutWork && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setCheckoutWork(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Buy ${checkoutWork.title}`}
        >
          <div
            className="gallery-modal-content ig-checkout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-modal-close-btn"
              onClick={() => setCheckoutWork(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="checkout-modal-body">
              <div className="checkout-preview-tile" style={{ backgroundColor: checkoutWork.color }}>
                <ArtworkCanvas work={checkoutWork} />
              </div>

              <div className="checkout-details-col">
                <span className="modal-code-tag">ACQUISITION • #{checkoutWork.code}</span>
                <h2 className="modal-title">{checkoutWork.title}</h2>
                <p className="checkout-artist-byline">
                  By {checkoutWork.artist} (<strong>@{checkoutWork.artistHandle}</strong>)
                </p>

                <div className="checkout-pricing-box">
                  <div className="checkout-price-row">
                    <span className="checkout-price-label">Edition Price</span>
                    <span className="checkout-price-val">{checkoutWork.price}</span>
                  </div>
                  <div className="checkout-edition-row">
                    <span className="checkout-edition-label">Availability</span>
                    <span className="checkout-edition-val">{checkoutWork.edition} Remaining</span>
                  </div>
                </div>

                <ul className="checkout-perks-list">
                  <li>✦ Includes 4K Master Cel &amp; Uncompressed SVG vector assets</li>
                  <li>✦ Signed studioNeo cryptographic certificate of authenticity</li>
                  <li>✦ Commercial display &amp; personal archiving permissions</li>
                </ul>

                <div className="checkout-modal-actions">
                  <button
                    type="button"
                    className="btn-pill-primary btn-pill-lg checkout-submit-btn"
                    onClick={() => {
                      showToast(`Purchase order registered for ${checkoutWork.code}!`);
                      setCheckoutWork(null);
                    }}
                  >
                    Proceed to Purchase — {checkoutWork.price}
                  </button>
                  <button
                    type="button"
                    className="btn-pill-secondary btn-pill-sm"
                    onClick={() => setCheckoutWork(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Detail Lightbox Preview Modal */}
      {activeWork && (
        <div
          className="gallery-modal-backdrop"
          onClick={() => setActiveWork(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeWork.title}
        >
          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-modal-close-btn"
              onClick={() => setActiveWork(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="gallery-modal-body">
              <div
                className="modal-media-wrap"
                style={{ backgroundColor: activeWork.color }}
              >
                <ArtworkCanvas work={activeWork} />
                {activeWork.isVault && (
                  <div className="vault-overlay-content">
                    <span className="vault-lock-icon" style={{ fontSize: '32px' }}>🔒</span>
                    <span className="vault-label" style={{ fontSize: '13px' }}>SUBSCRIBER VAULT</span>
                    <span className="vault-status">Members Only</span>
                  </div>
                )}
              </div>

              <div className="modal-info-col">
                <div>
                  <span className="modal-code-tag">{activeWork.code} • {activeWork.category}</span>
                  <h2 className="modal-title">{activeWork.title}</h2>
                  <p className="modal-desc">{activeWork.description}</p>

                  <div className="modal-specs-list">
                    <div className="modal-spec-row">
                      <span className="spec-key">Artist</span>
                      <span className="spec-val">{activeWork.artist} (@{activeWork.artistHandle})</span>
                    </div>
                    <div className="modal-spec-row">
                      <span className="spec-key">Edition</span>
                      <span className="spec-val">{activeWork.edition}</span>
                    </div>
                    <div className="modal-spec-row">
                      <span className="spec-key">Format</span>
                      <span className="spec-val">{activeWork.format} Vector Stems</span>
                    </div>
                    <div className="modal-spec-row">
                      <span className="spec-key">Valuation</span>
                      <span className="spec-val">{activeWork.price}</span>
                    </div>
                  </div>
                </div>

                  <div className="modal-actions-row">
                    {activeWork.isVault ? (
                      <Link href="/membership" className="btn-pill-primary">
                        Subscribe to Unlock ($12/mo)
                      </Link>
                    ) : (
                    <button
                      type="button"
                      className="btn-pill-primary"
                      onClick={() => {
                        setCheckoutWork(activeWork);
                        setActiveWork(null);
                      }}
                    >
                      Collect Edition ({activeWork.price})
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-pill-secondary"
                    onClick={() => setActiveWork(null)}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
