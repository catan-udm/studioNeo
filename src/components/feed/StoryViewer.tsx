'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import type { ArtistStory, FeedItem } from '@/lib/featuredFeedData';
import './storyViewer.css';

interface StoryViewerProps {
  stories: ArtistStory[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onViewInFeed: (story: ArtistStory) => void;
  likedIds: Set<string>;
  onToggleLike: (item: FeedItem, forceLike?: boolean) => void;
  onMarkViewed: (handle: string) => void;
}

const STORY_DURATION_MS = 5000;

export default function StoryViewer({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onViewInFeed,
  likedIds,
  onToggleLike,
  onMarkViewed,
}: StoryViewerProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [showHeartBurst, setShowHeartBurst] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [pullDownY, setPullDownY] = useState<number>(0);
  const [mediaOrientation, setMediaOrientation] = useState<'portrait' | 'landscape' | 'square'>('portrait');

  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTapRef = useRef<number>(0);
  const singleTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Touch gesture refs
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Sync currentIndex when opened or when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    elapsedRef.current = 0;
    setProgress(0);
    lastTimeRef.current = null;
    setPullDownY(0);
    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
      singleTapTimerRef.current = null;
    }
    lastTapRef.current = 0;
  }, [initialIndex, isOpen]);

  // Lock body scroll and pull-to-refresh while open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [isOpen]);

  const currentStory = stories[currentIndex] || stories[0];

  // Mark story as viewed as soon as it displays
  useEffect(() => {
    if (isOpen && currentStory?.artistHandle) {
      onMarkViewed(currentStory.artistHandle);
    }
  }, [isOpen, currentStory?.artistHandle, onMarkViewed]);

  // Eager preloading of adjacent story images
  useEffect(() => {
    if (!isOpen || stories.length === 0) return;
    const indicesToPreload = [
      (currentIndex + 1) % stories.length,
      (currentIndex + 2) % stories.length,
      (currentIndex - 1 + stories.length) % stories.length,
    ];
    indicesToPreload.forEach((idx) => {
      const s = stories[idx];
      if (s?.mediaSrc && typeof window !== 'undefined') {
        const img = new Image();
        img.src = s.mediaSrc;
      }
    });
  }, [isOpen, currentIndex, stories]);

  const handleNextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      elapsedRef.current = 0;
      setProgress(0);
      lastTimeRef.current = null;
      setPullDownY(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrevStory = useCallback(() => {
    if (elapsedRef.current > 1000) {
      // If watched > 1s, restart current story
      elapsedRef.current = 0;
      setProgress(0);
      lastTimeRef.current = null;
    } else if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      elapsedRef.current = 0;
      setProgress(0);
      lastTimeRef.current = null;
    }
    setPullDownY(0);
  }, [currentIndex]);

  // Main progress & animation timer loop
  useEffect(() => {
    if (!isOpen || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    const updateProgress = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        elapsedRef.current += delta;
        const currentProgress = Math.min(elapsedRef.current / STORY_DURATION_MS, 1);
        setProgress(currentProgress);

        if (elapsedRef.current >= STORY_DURATION_MS) {
          handleNextStory();
          return;
        }
      }
      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, isPaused, currentIndex, handleNextStory]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStory();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStory();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextStory, handlePrevStory, onClose]);

  // Image aspect ratio detection for Smart Dynamic Fit
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const ratio = w / h;
    if (ratio >= 1.15) {
      setMediaOrientation('landscape');
    } else if (ratio >= 0.88) {
      setMediaOrientation('square');
    } else {
      setMediaOrientation('portrait');
    }
  };

  // Download Master Cel (Partner artists only)
  const handleDownloadMaster = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (!currentStory) return;
      if (currentStory.distinction !== 'partner') return;

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60]);
        } catch {}
      }

      setDownloadToast('Downloading master cel...');

      try {
        const res = await fetch(currentStory.mediaSrc);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          const ext = currentStory.mediaKind === 'animated' ? 'gif' : 'jpg';
          const safeTitle = currentStory.title.replace(/[^a-zA-Z0-9_-]/g, '_');
          link.download = `${currentStory.artistHandle}_${safeTitle}.${ext}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
          setDownloadToast('Master cel saved!');
        } else {
          // Direct link fallback
          const link = document.createElement('a');
          link.href = currentStory.mediaSrc;
          link.download = `${currentStory.artistHandle}-master`;
          link.target = '_blank';
          link.click();
          setDownloadToast('Master cel saved!');
        }
      } catch {
        const link = document.createElement('a');
        link.href = currentStory.mediaSrc;
        link.download = `${currentStory.artistHandle}-master`;
        link.target = '_blank';
        link.click();
        setDownloadToast('Master cel saved!');
      } finally {
        setTimeout(() => setDownloadToast(null), 2500);
      }
    },
    [currentStory]
  );

  // Touch Gesture Listeners (Swipe Left, Swipe Right, Pull Down, Hold, Long Press)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;
    isLongPressTriggeredRef.current = false;

    // Pause story progress while holding
    setIsPaused(true);

    // Long press (>650ms) to download if and only if partnered
    if (currentStory?.distinction === 'partner') {
      longPressTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        handleDownloadMaster();
      }, 650);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // If moving significantly, cancel long press
    if (Math.abs(deltaX) > 12 || Math.abs(deltaY) > 12) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      isSwipingRef.current = true;
    }

    // Pull down to dismiss visual feedback
    if (deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      setPullDownY(Math.min(deltaY * 0.7, 140));
    } else {
      setPullDownY(0);
    }
  };

  const handleStageTap = (clientX: number) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // 1. Double tap detection (< 320ms) -> Always like, NEVER advance!
    if (timeSinceLastTap > 30 && timeSinceLastTap < 320) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = 0;

      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 850);
      if (currentStory?.feedItem) {
        onToggleLike(currentStory.feedItem, true);
      }
      return;
    }

    // 2. First tap: record timestamp
    lastTapRef.current = now;

    // Calculate position across card width
    const rect = stageRef.current?.getBoundingClientRect();
    const clickOffset = clientX - (rect ? rect.left : 0);
    const totalWidth = rect ? rect.width : window.innerWidth;
    const ratio = Math.max(0, Math.min(1, clickOffset / totalWidth));

    if (singleTapTimerRef.current) {
      clearTimeout(singleTapTimerRef.current);
    }

    // 3. Debounce single-tap navigation by 240ms to give time for double-tap
    singleTapTimerRef.current = setTimeout(() => {
      lastTapRef.current = 0;
      singleTapTimerRef.current = null;

      // Right side -> Next story
      if (ratio >= 0.58) {
        handleNextStory();
      }
      // Left side -> Previous story
      else if (ratio <= 0.42) {
        handlePrevStory();
      }
      // Center area -> toggle pause
      else {
        setIsPaused((p) => !p);
      }
    }, 240);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    setIsPaused(false);
    const pullDistance = pullDownY;
    setPullDownY(0);

    // If long press triggered, don't perform tap or swipe
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }

    if (e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;

    // 1. Pull down to dismiss gesture (drag down > 60px)
    if (pullDistance > 60 || (deltaY > 70 && Math.abs(deltaY) > Math.abs(deltaX) * 1.3)) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = 0;
      onClose();
      return;
    }

    // 2. Horizontal swipe gesture
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && elapsed < 600) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = 0;

      if (deltaX < 0) {
        // Swiped Left -> Next story
        handleNextStory();
      } else {
        // Swiped Right -> Previous story
        handlePrevStory();
      }
      return;
    }

    // 3. Tap gesture (finger moved less than 15px)
    if (!isSwipingRef.current && Math.abs(deltaX) < 15 && Math.abs(deltaY) < 15) {
      handleStageTap(touch.clientX);
    }
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a touch event just ran within 450ms, ignore synthetic click
    if (Date.now() - touchStartTimeRef.current < 450) return;
    handleStageTap(e.clientX);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory) return;
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${currentStory.archiveRoute}`
        : currentStory.archiveRoute;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLikeBtnClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStory?.feedItem) return;
    onToggleLike(currentStory.feedItem);
    if (!likedIds.has(currentStory.workId)) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 850);
    }
  };

  if (!isOpen || !mounted || !currentStory) return null;

  const isCurrentLiked = likedIds.has(currentStory.workId);
  const isLandscapeOrSquare = mediaOrientation === 'landscape' || mediaOrientation === 'square';
  const isPartner = currentStory.distinction === 'partner';

  const modalContent = (
    <div
      className="sn-story-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${currentStory.artistName} Story`}
    >
      {/* Background ambient color glow */}
      <div
        className="sn-story-ambient-glow"
        style={{ background: currentStory.accentColor || '#6366f1' }}
      />

      {/* Desktop Prev Button */}
      <button
        type="button"
        className="sn-story-nav-btn is-prev"
        onClick={handlePrevStory}
        disabled={currentIndex === 0 && elapsedRef.current <= 1000}
        aria-label="Previous Story"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Main 9:16 Vertical Story Stage */}
      <div
        ref={stageRef}
        className={`sn-story-stage ${isPaused ? 'is-paused' : ''}`}
        style={{
          transform: pullDownY > 0 ? `translate3d(0, ${pullDownY}px, 0) scale(${1 - pullDownY * 0.0012})` : undefined,
          opacity: pullDownY > 0 ? Math.max(0.4, 1 - pullDownY * 0.004) : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onClick={handleStageClick}
      >
        {/* Smart Dynamic Fit Media Layer */}
        <div className="sn-story-media-layer">
          {/* Ambient blurred backdrop for landscape & square artworks */}
          {isLandscapeOrSquare && (
            <img
              src={currentStory.mediaSrc}
              alt=""
              aria-hidden="true"
              className="sn-story-media-ambient"
            />
          )}

          {/* Main Foreground Artwork */}
          <img
            key={currentStory.workId}
            src={currentStory.mediaSrc}
            alt={currentStory.title}
            className={`sn-story-media-main ${isLandscapeOrSquare ? 'is-contain' : 'is-cover'}`}
            onLoad={handleImageLoad}
            draggable={false}
          />
        </div>

        {/* Double-Tap Heart Burst */}
        {showHeartBurst && (
          <div className="sn-story-heart-burst">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        )}

        {/* Gradient Scrims for readability */}
        <div className="sn-story-scrim-top" />
        <div className="sn-story-scrim-bottom" />

        {/* Segmented Progress Bar (Pushed safely below mobile URL bar) */}
        <div className="sn-story-progress-bar">
          {stories.map((story, idx) => {
            let segClass = 'is-unviewed';
            let segWidth = '0%';
            if (idx < currentIndex) {
              segClass = 'is-viewed';
              segWidth = '100%';
            } else if (idx === currentIndex) {
              segWidth = `${progress * 100}%`;
            }
            return (
              <div key={story.artistHandle} className={`sn-story-progress-seg ${segClass}`}>
                <div
                  className="sn-story-progress-fill"
                  style={{ width: segWidth }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Header */}
        <header
          className="sn-story-header"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <Link
            href={currentStory.archiveRoute}
            className="sn-story-artist-meta"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            title={`Visit @${currentStory.artistHandle} Archive`}
          >
            <div className={`sn-story-header-avatar-ring is-${currentStory.distinction}`}>
              <img
                src={currentStory.artistAvatar}
                alt={currentStory.artistName}
                className="sn-story-header-avatar"
              />
            </div>
            <div className="sn-story-header-info">
              <div className="sn-story-header-name-row">
                <span className="sn-story-header-name">{currentStory.artistName}</span>
                {currentStory.distinction === 'partner' && (
                  <span className="sn-story-header-badge is-partner">
                    {currentStory.badge}
                  </span>
                )}
              </div>
              <span className="sn-story-header-time">
                Latest work • {currentStory.dateLabel}
              </span>
            </div>
          </Link>

          <div
            className="sn-story-header-actions"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {/* Play / Pause Toggle Button */}
            <button
              type="button"
              className="sn-story-header-btn"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Resume story' : 'Pause story'}
              title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            >
              {isPaused ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="sn-story-header-btn"
              onClick={onClose}
              aria-label="Close story viewer"
              title="Close (Esc)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Bottom Story Footer with Meta & Actions */}
        <footer
          className="sn-story-footer"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div className="sn-story-info-card">
            <div className="sn-story-title-row">
              <h2 className="sn-story-work-title">{currentStory.title}</h2>
            </div>
            {currentStory.subtitle && (
              <span className="sn-story-work-subtitle">{currentStory.subtitle}</span>
            )}
            {currentStory.caption && (
              <p className="sn-story-caption">{currentStory.caption}</p>
            )}
            {currentStory.tags && currentStory.tags.length > 0 && (
              <div className="sn-story-tags">
                {currentStory.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="sn-story-tag-pill">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: View in Feed, Archive, Like, Download (Partners only), Share */}
          <div className="sn-story-actions-row">
            <button
              type="button"
              className="sn-story-btn-primary"
              onClick={() => onViewInFeed(currentStory)}
              title="Close story and scroll to this post in feed"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              View in Feed
            </button>

            <Link
              href={currentStory.archiveRoute}
              className="sn-story-btn-secondary"
              onClick={onClose}
              title={`Open @${currentStory.artistHandle} Archive`}
            >
              Archive
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>

            {/* Like Action */}
            <button
              type="button"
              className={`sn-story-icon-btn ${isCurrentLiked ? 'is-liked' : ''}`}
              onClick={handleLikeBtnClick}
              aria-label={isCurrentLiked ? 'Unlike work' : 'Like work'}
              title="Like"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isCurrentLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Download Action — Partner Artists Only */}
            {isPartner && (
              <button
                type="button"
                className="sn-story-icon-btn is-download"
                onClick={handleDownloadMaster}
                aria-label="Download master cel"
                title="Download Master Cel (Hold screen also downloads)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloadToast && <span className="sn-story-toast-download">{downloadToast}</span>}
              </button>
            )}

            {/* Share Action */}
            <button
              type="button"
              className="sn-story-icon-btn"
              onClick={handleShare}
              aria-label="Share work"
              title="Share"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied && <span className="sn-story-toast-copied">Copied!</span>}
            </button>
          </div>
        </footer>
      </div>

      {/* Desktop Next Button */}
      <button
        type="button"
        className="sn-story-nav-btn is-next"
        onClick={handleNextStory}
        aria-label="Next Story"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );

  return createPortal(modalContent, document.body);
}
