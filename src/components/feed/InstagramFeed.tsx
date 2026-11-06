'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  buildCuratedFeedItems,
  getFeaturedAndPartnerArtists,
  buildArtistStories,
  mapDbCelToFeedItem,
  isEligibleFeedArtist,
  type FeedItem,
  type ArtistStory,
} from '@/lib/featuredFeedData';
import type { AuthSubscriber } from '@/lib/clientAuthCache';
import StoryViewer from './StoryViewer';
import './feed.css';

interface InstagramFeedProps {
  currentUser: AuthSubscriber | null;
  onSwitchToAtelier?: () => void;
}

const PAGE_SIZE = 6;

export default function InstagramFeed({ currentUser, onSwitchToAtelier }: InstagramFeedProps) {
  const baseCuratedItems = useMemo(() => buildCuratedFeedItems(), []);
  const storyArtists = useMemo(() => getFeaturedAndPartnerArtists(), []);

  const [dbFeedItems, setDbFeedItems] = useState<FeedItem[]>([]);
  const artistStories = useMemo(
    () => buildArtistStories(dbFeedItems),
    [dbFeedItems]
  );

  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [viewedHandles, setViewedHandles] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('studioneo_viewed_stories');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return new Set(parsed.map((s: string) => String(s).toLowerCase()));
          }
        }
      } catch {}
    }
    return new Set();
  });

  const [distinctionFilter, setDistinctionFilter] = useState<'all' | 'partner' | 'featured'>('all');
  const [selectedArtistHandle, setSelectedArtistHandle] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [infiniteCycle, setInfiniteCycle] = useState<number>(1);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likeDeltas, setLikeDeltas] = useState<Record<string, number>>({});
  const [burstingId, setBurstingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // User-scoped storage key to ensure likes never bleed across accounts
  const userStorageKey = useMemo(() => {
    const uid = currentUser?.id || currentUser?.handle || currentUser?.email;
    return uid ? `studioNeo_user_likes_${uid}` : 'studioNeo_user_likes_guest';
  }, [currentUser]);

  // Load any database-minted works from Partner & Featured artists
  useEffect(() => {
    let active = true;
    fetch('/api/cels')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.cels) return;
        const mapped: FeedItem[] = [];
        for (const cel of data.cels) {
          const item = mapDbCelToFeedItem(cel);
          if (item && isEligibleFeedArtist(item.artistHandle)) {
            mapped.push(item);
          }
        }
        setDbFeedItems(mapped);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Load persisted likes: instant hydration from user-scoped localStorage + reconcile with server database
  useEffect(() => {
    let active = true;

    // Instant read from user-scoped storage
    try {
      const cached = localStorage.getItem(userStorageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLikedIds(new Set(parsed));
        } else {
          setLikedIds(new Set());
        }
      } else {
        setLikedIds(new Set());
      }
    } catch {
      setLikedIds(new Set());
    }

    // Sync from server-side database
    fetch('/api/cels/like')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const setFromApi = new Set<string>();

        if (Array.isArray(data.likedIds)) {
          for (const id of data.likedIds) {
            setFromApi.add(String(id));
          }
        }
        if (Array.isArray(data.likedArtworkIds)) {
          for (const id of data.likedArtworkIds) {
            setFromApi.add(`db-artwork-${id}`);
            setFromApi.add(String(id));
          }
        }

        if (data.authenticated) {
          setLikedIds(setFromApi);
          try {
            localStorage.setItem(userStorageKey, JSON.stringify(Array.from(setFromApi)));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [userStorageKey]);

  // Merge DB works + curated works, strictly filtering out any non-featured/non-partner artists
  const allFilteredPool = useMemo(() => {
    const combined = [...dbFeedItems, ...baseCuratedItems].filter(
      (item) =>
        isEligibleFeedArtist(item.artistHandle) &&
        (item.distinction === 'partner' || item.distinction === 'featured')
    );

    return combined.filter((item) => {
      if (distinctionFilter !== 'all' && item.distinction !== distinctionFilter) {
        return false;
      }
      if (
        selectedArtistHandle &&
        item.artistHandle.toLowerCase() !== selectedArtistHandle.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [dbFeedItems, baseCuratedItems, distinctionFilter, selectedArtistHandle]);

  // Expand pool across infinite cycles for seamless endless scrolling
  const expandedFeed = useMemo(() => {
    if (allFilteredPool.length === 0) return [];
    const list: Array<FeedItem & { renderKey: string }> = [];
    for (let c = 0; c < infiniteCycle; c++) {
      for (const item of allFilteredPool) {
        list.push({
          ...item,
          renderKey: c === 0 ? item.id : `${item.id}-cycle-${c}`,
        });
      }
    }
    return list;
  }, [allFilteredPool, infiniteCycle]);

  const visibleItems = useMemo(
    () => expandedFeed.slice(0, visibleCount),
    [expandedFeed, visibleCount]
  );

  // IntersectionObserver for Infinite Scrolling
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first && first.isIntersecting) {
          setVisibleCount((prev) => {
            const next = prev + PAGE_SIZE;
            if (next >= expandedFeed.length && allFilteredPool.length > 0) {
              setInfiniteCycle((c) => c + 1);
            }
            return next;
          });
        }
      },
      { rootMargin: '420px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [expandedFeed.length, allFilteredPool.length]);

  const toggleLike = useCallback(
    (item: FeedItem, forceLike = false) => {
      setLikedIds((prev) => {
        const alreadyLiked = prev.has(item.id);
        if (forceLike && alreadyLiked) return prev;

        const next = new Set(prev);
        const nowLiked = !alreadyLiked;
        if (nowLiked) {
          next.add(item.id);
        } else {
          next.delete(item.id);
        }

        setLikeDeltas((d) => ({
          ...d,
          [item.id]: nowLiked ? 1 : 0,
        }));

        // Persist to user-scoped localStorage immediately
        try {
          localStorage.setItem(userStorageKey, JSON.stringify(Array.from(next)));
        } catch {}

        // Persist to database per user via API
        fetch('/api/cels/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetId: item.id,
            artworkId: item.dbId,
            code: item.code,
          }),
        }).catch((err) => {
          console.warn('[Feed] Failed to persist like to server:', err);
        });

        return next;
      });
    },
    [userStorageKey]
  );

  const handleDoubleTap = useCallback(
    (item: FeedItem, renderKey: string) => {
      toggleLike(item, true);
      setBurstingId(renderKey);
      setTimeout(() => {
        setBurstingId((curr) => (curr === renderKey ? null : curr));
      }, 850);
    },
    [toggleLike]
  );

  const handleShare = useCallback((item: FeedItem, renderKey: string) => {
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${item.archiveRoute}`
        : item.archiveRoute;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedId(renderKey);
    setTimeout(() => {
      setCopiedId((curr) => (curr === renderKey ? null : curr));
    }, 1800);
  }, []);

  const markStoryViewed = useCallback((handle: string) => {
    setViewedHandles((prev) => {
      const lower = handle.toLowerCase();
      if (prev.has(lower)) return prev;
      const next = new Set(prev);
      next.add(lower);
      try {
        localStorage.setItem('studioneo_viewed_stories', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const handleOpenStory = useCallback(
    (artistHandle: string) => {
      const idx = artistStories.findIndex(
        (s) => s.artistHandle.toLowerCase() === artistHandle.toLowerCase()
      );
      if (idx !== -1) {
        setActiveStoryIndex(idx);
        markStoryViewed(artistHandle);
      }
    },
    [artistStories, markStoryViewed]
  );

  const handleViewInFeed = useCallback(
    (story: ArtistStory) => {
      setActiveStoryIndex(null);

      // If active filter excludes this artist, clear it so card is visible
      if (
        selectedArtistHandle &&
        selectedArtistHandle.toLowerCase() !== story.artistHandle.toLowerCase()
      ) {
        setSelectedArtistHandle(null);
      }

      // Ensure the target card is rendered within visibleCount
      const targetIdx = expandedFeed.findIndex((item) => item.id === story.workId);
      if (targetIdx !== -1 && targetIdx >= visibleCount) {
        setVisibleCount(targetIdx + PAGE_SIZE);
      }

      setTimeout(() => {
        const el = document.getElementById(`post-${story.workId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('sn-post-highlight');
          setTimeout(() => el.classList.remove('sn-post-highlight'), 2200);
        }
      }, 120);
    },
    [selectedArtistHandle, expandedFeed, visibleCount]
  );

  const userDisplay =
    currentUser?.displayName ||
    currentUser?.handle ||
    currentUser?.email?.split('@')[0] ||
    'Collector';

  const userInitials = useMemo(() => {
    if (!currentUser) return 'SN';
    const name = currentUser.displayName || currentUser.handle || currentUser.email || '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'SN').toUpperCase();
  }, [currentUser]);

  const userDistinctionClass = useMemo(() => {
    if (!currentUser) return 'collector';
    if (currentUser.artistDistinction && currentUser.artistDistinction !== 'none') {
      return currentUser.artistDistinction;
    }
    if (currentUser.systemRole === 'admin') return 'admin';
    if (currentUser.systemRole === 'curator') return 'curator';
    return 'collector';
  }, [currentUser]);

  const isArtistOrCurator =
    currentUser?.systemRole === 'curator' ||
    currentUser?.systemRole === 'admin' ||
    (currentUser?.artistDistinction && currentUser.artistDistinction !== 'none');

  return (
    <main
      id="main-content"
      className="sn-feed-root"
      aria-label="Curated Partner and Featured Artist Feed"
    >
      <div className="sn-feed-layout">
        {/* Desktop Left Profile Card Sidebar */}
        <aside className="sn-feed-sidebar-left" aria-label="Collector Profile & Actions">
          <div className="sn-profile-card">
            <div className="sn-profile-header">
              <div className={`sn-profile-avatar-wrap is-${userDistinctionClass}`}>
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={userDisplay}
                    className="sn-profile-avatar"
                  />
                ) : (
                  <div className="sn-profile-avatar-fallback">
                    {userInitials}
                  </div>
                )}
                {currentUser?.is_verified && (
                  <span
                    className="sn-profile-verified-dot"
                    title="Verified Sovereign Identity"
                    aria-label="Verified"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="sn-profile-identity">
                <div className="sn-profile-name-row">
                  <h2 className="sn-profile-name">{userDisplay}</h2>
                  {currentUser?.is_verified && (
                    <svg
                      className="sn-profile-verified-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-label="Verified Sovereign"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="sn-profile-handle">
                  @{currentUser?.handle || (currentUser?.email ? currentUser.email.split('@')[0] : 'collector')}
                </span>
              </div>
            </div>

            <p className="sn-profile-bio">
              {currentUser?.bio || 'Sovereign Archive Collector & Creative Code Enthusiast'}
            </p>

            <div className="sn-profile-meta-grid">
              <div className="sn-profile-meta-chip">
                <span className="sn-profile-meta-label">Passkeys</span>
                <span className="sn-profile-meta-val">
                  {currentUser?.passkeyCount ?? 0} bound
                </span>
              </div>
              <div className="sn-profile-meta-chip">
                <span className="sn-profile-meta-label">2FA Security</span>
                <span className="sn-profile-meta-val">
                  {currentUser?.twoFactorActive ? 'Active' : 'Standard'}
                </span>
              </div>
              <div className="sn-profile-meta-chip">
                <span className="sn-profile-meta-label">ID</span>
                <span className="sn-profile-meta-val">
                  #{currentUser?.id ?? '—'}
                </span>
              </div>
            </div>

            <nav className="sn-profile-actions" aria-label="Quick Navigation">
              <Link href="/dashboard" className="sn-profile-btn is-primary">
                Collector Dashboard
                <span className="sn-profile-btn-arrow">→</span>
              </Link>
              <Link href="/settings" className="sn-profile-btn">
                Settings &amp; Keys
                <span className="sn-profile-btn-arrow">⚙</span>
              </Link>
              {isArtistOrCurator && (
                <Link href="/studio/upload" className="sn-profile-btn is-upload">
                  Mint / Upload Art
                  <span className="sn-profile-btn-arrow">✦</span>
                </Link>
              )}
              {onSwitchToAtelier && (
                <button
                  type="button"
                  className="sn-profile-btn is-secondary"
                  onClick={onSwitchToAtelier}
                >
                  Atelier Overview
                  <span className="sn-profile-btn-arrow">↗</span>
                </button>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Feed Column */}
        <div className="sn-feed-main-col">
          {/* Top Greeting & Distinction Filter Bar */}
        <header className="sn-feed-top-bar">
          <div className="sn-feed-greeting">
            <span className="sn-feed-eyebrow">Curated Stream • Welcome, {userDisplay}</span>
            <h1 className="sn-feed-title">Partner &amp; Featured Showcase</h1>
          </div>

          <div className="sn-feed-controls">
            <button
              type="button"
              className={`sn-feed-filter-pill ${distinctionFilter === 'all' ? 'is-active' : ''}`}
              onClick={() => {
                setDistinctionFilter('all');
                setVisibleCount(PAGE_SIZE);
              }}
            >
              All Curated
            </button>
            <button
              type="button"
              className={`sn-feed-filter-pill ${distinctionFilter === 'partner' ? 'is-active' : ''}`}
              onClick={() => {
                setDistinctionFilter('partner');
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Partnered
            </button>
            <button
              type="button"
              className={`sn-feed-filter-pill ${distinctionFilter === 'featured' ? 'is-active' : ''}`}
              onClick={() => {
                setDistinctionFilter('featured');
                setVisibleCount(PAGE_SIZE);
              }}
            >
              Featured
            </button>
            {onSwitchToAtelier && (
              <button
                type="button"
                className="sn-feed-atelier-switch"
                onClick={onSwitchToAtelier}
                title="View public studioNeo atelier overview"
              >
                Atelier View
              </button>
            )}
          </div>
        </header>

        {/* Instagram-Style Artist Story Carousel */}
        <section className="sn-stories-bar" aria-label="Featured and Partnered Artists">
          {storyArtists.map((artist) => {
            const isSelected =
              selectedArtistHandle?.toLowerCase() === artist.handle.toLowerCase();
            const isViewed = viewedHandles.has(artist.handle.toLowerCase());
            return (
              <div
                key={artist.handle}
                className={`sn-story-item ${isSelected ? 'is-selected' : ''}`}
              >
                <button
                  type="button"
                  className={`sn-story-ring ${isViewed ? 'is-viewed' : 'is-unviewed'} is-${artist.distinction}`}
                  onClick={() => handleOpenStory(artist.handle)}
                  title={`Watch @${artist.handle}'s latest story • ${artist.badge}`}
                  aria-label={`Watch story from ${artist.displayName}`}
                >
                  {artist.avatar.startsWith('data:') || artist.avatar.startsWith('http') ? (
                    <img
                      src={artist.avatar}
                      alt={artist.displayName}
                      className="sn-story-avatar"
                      loading="lazy"
                    />
                  ) : (
                    <span className="sn-story-avatar">{artist.avatar}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="sn-story-name-btn"
                  onClick={() => {
                    setSelectedArtistHandle((prev) =>
                      prev?.toLowerCase() === artist.handle.toLowerCase() ? null : artist.handle
                    );
                    setVisibleCount(PAGE_SIZE);
                  }}
                  title={`Filter feed by @${artist.handle}`}
                >
                  <span className="sn-story-name">{artist.displayName}</span>
                </button>
              </div>
            );
          })}
        </section>

        {/* Active Artist Filter Pill */}
        {selectedArtistHandle && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderRadius: '14px',
              background: 'rgba(99, 102, 241, 0.1)',
              fontSize: '13px',
            }}
          >
            <span>
              Showing works by <strong>@{selectedArtistHandle}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedArtistHandle(null)}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: 700,
                color: '#6366f1',
                cursor: 'pointer',
              }}
            >
              Clear Filter ×
            </button>
          </div>
        )}

        {/* Infinite Scrolling Feed Posts */}
        {visibleItems.map((item) => {
          const isLiked = likedIds.has(item.id);
          const totalLikes = item.initialLikes + (likeDeltas[item.id] || 0);
          const isBursting = burstingId === item.renderKey;
          const isCopied = copiedId === item.renderKey;

          return (
            <article key={item.renderKey} id={`post-${item.id}`} className="sn-post-card">
              {/* Post Header */}
              <div className="sn-post-header">
                <Link href={item.archiveRoute} className="sn-post-author">
                  <div className={`sn-post-avatar-wrap is-${item.distinction}`}>
                    {item.artistAvatar.startsWith('data:') ||
                    item.artistAvatar.startsWith('http') ? (
                      <img
                        src={item.artistAvatar}
                        alt={item.artistName}
                        className="sn-post-avatar"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="sn-post-avatar"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {item.artistAvatar}
                      </div>
                    )}
                  </div>

                  <div className="sn-post-author-meta">
                    <div className="sn-post-author-row">
                      <span className="sn-post-author-name">{item.artistName}</span>
                    </div>
                    <span className="sn-post-subline">
                      @{item.artistHandle}
                      {item.subtitle ? ` • ${item.subtitle}` : ''}
                    </span>
                  </div>
                </Link>

                <Link href={item.archiveRoute} className="sn-post-archive-link">
                  View Archive →
                </Link>
              </div>

              {/* Media Frame (Double-click / Double-tap to Like) */}
              <div
                className="sn-post-media-container"
                onDoubleClick={() => handleDoubleTap(item, item.renderKey)}
              >
                <img
                  src={item.mediaSrc}
                  alt={item.title}
                  className="sn-post-media-img"
                  loading="lazy"
                />

                {isBursting && (
                  <div className="sn-heart-burst" aria-hidden="true">
                    <svg width="92" height="92" viewBox="0 0 24 24" fill="#f43f5e">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Action Row */}
              <div className="sn-post-actions">
                <div className="sn-post-actions-left">
                  <button
                    type="button"
                    className={`sn-action-btn ${isLiked ? 'is-liked' : ''}`}
                    onClick={() => toggleLike(item)}
                    aria-label={isLiked ? 'Unlike artwork' : 'Like artwork'}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{totalLikes.toLocaleString()}</span>
                  </button>

                  <button
                    type="button"
                    className="sn-action-btn"
                    onClick={() => handleShare(item, item.renderKey)}
                    aria-label="Share artwork link"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>{isCopied ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                {/* Direct GIF Download for Sankobite Partner Animations */}
                {item.canDownloadMaster && item.artistHandle === 'sankobite' && (
                  <a
                    href={`/api/assets/download/${encodeURIComponent((item.slug || item.code).toLowerCase())}?format=gif`}
                    download={`sankobite-${item.slug || item.code}.gif`}
                    className="sn-sovereignty-pill is-partner"
                    title={`Download animated GIF for ${item.title}`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download GIF
                  </a>
                )}
              </div>

              {/* Caption & Tags */}
              <div className="sn-post-body">
                <div className="sn-post-likes-line">
                  {totalLikes.toLocaleString()} likes
                </div>

                <p className="sn-post-caption">
                  <span className="sn-post-caption-author">@{item.artistHandle}</span>
                  <span className="sn-post-caption-title">{item.title}</span>
                  {item.caption}
                </p>

                {item.tags.length > 0 && (
                  <div className="sn-post-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="sn-post-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="sn-post-footer-meta">
                  <span>{item.dateLabel}</span>
                  <span>
                    {item.distinction === 'partner'
                      ? 'Authorized Partner Collaboration'
                      : 'Curated Featured Showcase'}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="sn-feed-sentinel" aria-live="polite">
          <div className="sn-feed-spinner" />
          <span style={{ fontSize: '12px', opacity: 0.65 }}>
            Loading more Partner &amp; Featured works...
          </span>
        </div>
      </div>
      </div>

      {/* Immersive Instagram-Style Artist Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewer
          stories={artistStories}
          initialIndex={activeStoryIndex}
          isOpen={activeStoryIndex !== null}
          onClose={() => setActiveStoryIndex(null)}
          onViewInFeed={handleViewInFeed}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          onMarkViewed={markStoryViewed}
        />
      )}
    </main>
  );
}
