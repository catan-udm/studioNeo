'use client';

import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import BikkoMark from './BikkoMark';
import { usePageTransition } from './PageTransition';
import { useSettings } from './SettingsProvider';
import { getAuthenticatedSession, invalidateAuthCache } from '@/lib/clientAuthCache';

const subscribeToReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener?.('change', callback);
  return () => {
    mq.removeEventListener?.('change', callback);
  };
};

const getReducedMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getReducedMotionServerSnapshot = () => false;

type TabKey = 'studio' | 'projects' | 'gallery' | 'about' | 'dashboard';

export default function StudioNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isNavigating, startNavigation } = usePageTransition();
  const { openSettings, motion } = useSettings();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  // Scroll state for water droplet detach / rejoin
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const isNavigatingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const minimizeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Check current session status with inflight deduplication and TTL cache
  const checkAuth = useCallback(async () => {
    try {
      const data = await getAuthenticatedSession();
      if (data?.authenticated) {
        setIsAuthenticated(true);
        setUserEmail(data.subscriber?.email || 'Active Subscriber');
        return;
      }
      setIsAuthenticated(false);
      setUserEmail(null);
    } catch {
      setIsAuthenticated(false);
      setUserEmail(null);
    }
  }, []);

  useEffect(() => {
    const authTask = window.setTimeout(() => {
      void checkAuth();
    }, 0);

    return () => window.clearTimeout(authTask);
  }, [checkAuth]);

  // Dynamic Island Minimization state & logic (for non-reduced motion views, during dynamic-island mode only)

  // Subscribe to system reduced motion preference using useSyncExternalStore
  const isSystemReduced = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const isReducedMotion = motion === 'reduced' || (motion === 'system' && isSystemReduced);
  const isNavMinimized = isScrolled && !isReducedMotion && isMinimized;

  const isReducedMotionRef = useRef(isReducedMotion);
  const isMenuOpenRef = useRef(isMenuOpen);
  const isScrolledRef = useRef(isScrolled);
  const isMinimizedRef = useRef(isMinimized);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    isReducedMotionRef.current = isReducedMotion;
    isMenuOpenRef.current = isMenuOpen;
    isScrolledRef.current = isScrolled;
    isMinimizedRef.current = isMinimized;
  }, [isReducedMotion, isMenuOpen, isScrolled, isMinimized]);

  const clearMinimizeTimer = useCallback(() => {
    if (minimizeTimerRef.current) {
      clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = null;
    }
  }, []);

  const startMinimizeTimer = useCallback((delay = 5000) => {
    clearMinimizeTimer();
    if (!isScrolledRef.current || isReducedMotionRef.current || isMenuOpenRef.current || isHoveredRef.current) {
      return;
    }
    minimizeTimerRef.current = setTimeout(() => {
      if (isScrolledRef.current && !isReducedMotionRef.current && !isMenuOpenRef.current && !isHoveredRef.current) {
        setIsMinimized(true);
      }
    }, delay);
  }, [clearMinimizeTimer, setIsMinimized]);

  // Scroll, wheel, touch, and top-edge mousemove listeners: pop the navbar back up instantly if scrolling or hovering again
  useEffect(() => {
    let ticking = false;
    lastScrollYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const popBackUpAndResetTimer = () => {
      // If currently minimized, immediately pop back up into view
      if (isMinimizedRef.current) {
        setIsMinimized(false);
      }
      // Re-arm the minimize timer once active scrolling stops
      if (isScrolledRef.current && !isReducedMotionRef.current && !isMenuOpenRef.current && !isHoveredRef.current) {
        startMinimizeTimer(5000);
      }
    };

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = isNavigatingRef.current ? false : currentScrollY > 40;

      // Pop the navbar back up if user scrolls while in dynamic-island mode
      if (currentScrollY !== lastScrollYRef.current) {
        popBackUpAndResetTimer();
      }
      lastScrollYRef.current = currentScrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((prev) => {
            if (prev && !scrolled) {
              setIsMinimized(false);
            }
            return prev === scrolled ? prev : scrolled;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    // Catch wheel gestures (trackpad or mouse wheel) even on boundary states
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0.5 || Math.abs(e.deltaX) > 0.5) {
        popBackUpAndResetTimer();
      }
    };

    // Catch touch gestures on mobile / tablet
    const onTouchMove = () => {
      popBackUpAndResetTimer();
    };

    // Catch mouse moving towards top edge when minimized (throttled via RAF to eliminate idle CPU churn)
    let mouseTicking = false;
    const onMouseMove = (e: MouseEvent) => {
      if (!isMinimizedRef.current) return;
      if (!mouseTicking) {
        mouseTicking = true;
        window.requestAnimationFrame(() => {
          if (isMinimizedRef.current && e.clientY <= 28) {
            setIsMinimized(false);
            isHoveredRef.current = true;
            clearMinimizeTimer();
          }
          mouseTicking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Check initial scroll state
    const initialStateTask = window.requestAnimationFrame(() => {
      if (window.scrollY > 40) setIsScrolled(true);
    });

    return () => {
      window.cancelAnimationFrame(initialStateTask);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [startMinimizeTimer, clearMinimizeTimer]);

  // Handle idle minimization timer (only schedules when in dynamic-island mode and not reduced motion)
  useEffect(() => {
    if (isScrolled && !isReducedMotion && !isMenuOpen && !isHoveredRef.current) {
      startMinimizeTimer(5000);
    } else {
      clearMinimizeTimer();
    }
    return () => clearMinimizeTimer();
  }, [isScrolled, isReducedMotion, isMenuOpen, startMinimizeTimer, clearMinimizeTimer]);

  // Mouse & Focus handlers to prevent minimization while the navbar is in use
  const handleNavMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    clearMinimizeTimer();
    setIsMinimized(false);
  }, [clearMinimizeTimer, setIsMinimized]);

  const handleNavMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (isScrolled && !isReducedMotion && !isMenuOpen) {
      startMinimizeTimer(2500);
    }
  }, [isScrolled, isReducedMotion, isMenuOpen, startMinimizeTimer]);

  const handleNavFocus = useCallback(() => {
    isHoveredRef.current = true;
    clearMinimizeTimer();
    setIsMinimized(false);
  }, [clearMinimizeTimer, setIsMinimized]);

  const handleNavBlur = useCallback((e: React.FocusEvent) => {
    const nextTarget = e.relatedTarget as Node | null;
    if (headerRef.current && !headerRef.current.contains(nextTarget)) {
      isHoveredRef.current = false;
      if (isScrolled && !isReducedMotion && !isMenuOpen) {
        startMinimizeTimer(2500);
      }
    }
  }, [isScrolled, isReducedMotion, isMenuOpen, startMinimizeTimer]);

  // Handle Sign Out
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed even if request fails
    } finally {
      invalidateAuthCache();
      setIsAuthenticated(false);
      setUserEmail(null);
      setIsSigningOut(false);
      setIsMenuOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  // Close menu on click outside, Escape key, route change, or scroll mode change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsMenuOpen((open) => (open ? false : open));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, isScrolled]);

  const isHome = pathname === '/';

  const getTabFromPath = (path: string): TabKey | null => {
    if (path === '/about') return 'about';
    if (path === '/projects') return 'projects';
    if (path === '/gallery') return 'gallery';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/') return 'studio';
    return null;
  };

  const [activeTab, setActiveTab] = useState<TabKey | null>(() => getTabFromPath(pathname));
  const sliderRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key in TabKey]?: HTMLAnchorElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // Synchronize activeTab with current route
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setActiveTab(getTabFromPath(pathname));
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Measure and align the Apple sliding capsule indicator
  // Normalizes by scale factor to eliminate ancestor transform distortion (e.g. scale(0.92) on mobile)
  const updateIndicator = useCallback(() => {
    if (!activeTab) {
      setIndicatorStyle({ left: 0, width: 0, opacity: 0 });
      return;
    }
    const activeEl = tabRefs.current[activeTab];
    const sliderEl = sliderRef.current;
    if (activeEl && sliderEl) {
      const sliderRect = sliderEl.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const scaleX = sliderEl.offsetWidth > 0 ? sliderRect.width / sliderEl.offsetWidth : 1;

      const left = scaleX > 0
        ? (activeRect.left - sliderRect.left) / scaleX - sliderEl.clientLeft
        : activeEl.offsetLeft;
      const width = scaleX > 0
        ? activeRect.width / scaleX
        : activeEl.offsetWidth;

      setIndicatorStyle({
        left: Math.round(left * 100) / 100,
        width: Math.round(width * 100) / 100,
        opacity: 1,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      updateIndicator();
    });
    const timer = setTimeout(updateIndicator, 40);
    const scrollTimer = setTimeout(updateIndicator, 150);

    const sliderEl = sliderRef.current;
    let observer: ResizeObserver | null = null;
    if (sliderEl && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        updateIndicator();
      });
      observer.observe(sliderEl);
    }

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(updateIndicator);
    }

    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      clearTimeout(scrollTimer);
      observer?.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator, isScrolled]);

  // Immediate tab click with instantaneous navigation and synchronized indicator
  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tab: TabKey,
    targetHref: string
  ) => {
    setActiveTab(tab);

    if (pathname === targetHref) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      startNavigation(targetHref);
    }
  };

  // Helper to render curated icon-only menu buttons in horizontal (static) or vertical (scrolled) orientation
  const renderBurgerIconButtons = (orientation: 'horizontal' | 'vertical') => (
    <>
      {/* Section 1: Settings, Profile, Terms & Policies */}
      <div
        className={`burger-menu-section burger-menu-${orientation}`}
        role="group"
        aria-label="Preferences and Profile"
      >
        <button
          type="button"
          className="burger-icon-btn"
          aria-label="Settings"
          title="Settings"
          onClick={() => {
            setIsMenuOpen(false);
            openSettings();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="burger-icon-tooltip">Settings</span>
        </button>

        <Link
          href="/dashboard"
          prefetch={true}
          className="burger-icon-btn"
          aria-label={userEmail ? `Profile (${userEmail})` : 'Profile'}
          title={userEmail ? `Profile (${userEmail})` : 'Profile'}
          onClick={() => setIsMenuOpen(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="burger-icon-tooltip">{userEmail ? userEmail : 'Profile'}</span>
        </Link>

        <Link
          href="/terms"
          prefetch={true}
          className="burger-icon-btn"
          aria-label="Terms &amp; Policies"
          title="Terms &amp; Policies"
          onClick={() => setIsMenuOpen(false)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <span className="burger-icon-tooltip">Terms &amp; Policies</span>
        </Link>
      </div>

      {/* Hairline Divider */}
      <div className={`burger-menu-divider burger-divider-${orientation}`} />

      {/* Section 2: Sign In & Sign Up (or Sign Out when authenticated) */}
      <div
        className={`burger-menu-section burger-menu-${orientation} burger-menu-auth`}
        role="group"
        aria-label="Account Access"
      >
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="burger-icon-btn burger-signout-btn"
            aria-label="Sign Out"
            title="Sign Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="burger-icon-tooltip">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        ) : (
          <>
            <Link
              href="/login"
              prefetch={true}
              className="burger-icon-btn"
              aria-label="Sign In"
              title="Sign In"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span className="burger-icon-tooltip">Sign In</span>
            </Link>

            <Link
              href="/register"
              prefetch={true}
              className="burger-icon-btn burger-signup-btn"
              aria-label="Sign Up"
              title="Sign Up"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span className="burger-icon-tooltip">Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={`studio-nav-header ${isScrolled ? 'is-scrolled' : ''} ${isNavMinimized ? 'is-minimized' : ''}`}
        role="banner"
        onMouseEnter={handleNavMouseEnter}
        onMouseLeave={handleNavMouseLeave}
        onFocusCapture={handleNavFocus}
        onBlurCapture={handleNavBlur}
      >
        <div className="studio-nav-inner">
          {/* Island 1: Logo Bubble */}
          <div className="studio-nav-left bubble-island">
            <Link
              href="/"
              prefetch={true}
              className="studio-nav-brand-link"
              aria-label="Bikko Studio home"
              onClick={(e) => {
                if (isHome) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveTab('studio');
                } else {
                  startNavigation('/');
                }
              }}
            >
              <div className="studio-nav-logo-wrap">
                <BikkoMark width={32} height={28} />
              </div>
            </Link>
          </div>

          {/* Island 2: Slider Bubble in the Middle */}
          <div className={`studio-nav-center ${isMenuOpen && !isScrolled ? 'nav-menu-open' : ''}`}>
            <nav
              ref={sliderRef}
              className="studio-nav-slider bubble-island"
              aria-label="Main Navigation"
            >
              {/* Apple Sliding Capsule Indicator */}
              <div
                className={`nav-slider-indicator ${isNavigating ? 'is-navigating' : ''}`}
                style={{
                  transform: `translateX(${indicatorStyle.left}px)`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
              />
              <Link
                ref={(el) => {
                  tabRefs.current['studio'] = el;
                }}
                href="/"
                prefetch={true}
                className={`nav-pill ${activeTab === 'studio' ? 'active' : ''}`}
                aria-current={activeTab === 'studio' ? 'page' : undefined}
                aria-label="Studio"
                title="Studio"
                onClick={(e) => handleTabClick(e, 'studio', '/')}
              >
                <span className="nav-pill-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <span className="nav-pill-text">Studio</span>
              </Link>
              <Link
                ref={(el) => {
                  tabRefs.current['projects'] = el;
                }}
                href="/projects"
                prefetch={true}
                className={`nav-pill ${activeTab === 'projects' ? 'active' : ''}`}
                aria-current={activeTab === 'projects' ? 'page' : undefined}
                aria-label="Projects"
                title="Projects"
                onClick={(e) => handleTabClick(e, 'projects', '/projects')}
              >
                <span className="nav-pill-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M7 3v18" />
                    <path d="M17 3v18" />
                    <path d="M3 12h18" />
                    <path d="M3 7.5h4" />
                    <path d="M3 16.5h4" />
                    <path d="M17 7.5h4" />
                    <path d="M17 16.5h4" />
                  </svg>
                </span>
                <span className="nav-pill-text">Projects</span>
              </Link>
              <Link
                ref={(el) => {
                  tabRefs.current['gallery'] = el;
                }}
                href="/gallery"
                prefetch={true}
                className={`nav-pill ${activeTab === 'gallery' ? 'active' : ''}`}
                aria-current={activeTab === 'gallery' ? 'page' : undefined}
                aria-label="Gallery"
                title="Gallery"
                onClick={(e) => handleTabClick(e, 'gallery', '/gallery')}
              >
                <span className="nav-pill-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="14" rx="1.5" />
                    <rect width="7" height="7" x="3" y="14" rx="1.5" />
                  </svg>
                </span>
                <span className="nav-pill-text">Gallery</span>
              </Link>
              <Link
                ref={(el) => {
                  tabRefs.current['about'] = el;
                }}
                href="/about"
                prefetch={true}
                className={`nav-pill ${activeTab === 'about' ? 'active' : ''}`}
                aria-current={activeTab === 'about' ? 'page' : undefined}
                aria-label="About"
                title="About"
                onClick={(e) => handleTabClick(e, 'about', '/about')}
              >
                <span className="nav-pill-icon" aria-hidden="true">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </span>
                <span className="nav-pill-text">About</span>
              </Link>
              {isAuthenticated && (
                <Link
                  ref={(el) => {
                    tabRefs.current['dashboard'] = el;
                  }}
                  href="/dashboard"
                  prefetch={true}
                  className={`nav-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
                  aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                  aria-label="Dashboard"
                  title="Dashboard"
                  onClick={(e) => handleTabClick(e, 'dashboard', '/dashboard')}
                >
                  <span className="nav-pill-icon" aria-hidden="true">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="nav-pill-text">Dashboard</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Action Buttons & Island 3: Burger Menu Bubble */}
          <div className="studio-nav-right" ref={menuRef}>
            {/* Static Nav Bar Actions (revealed to the left when burger is clicked on static nav bar) */}
            <div
              className={`nav-static-actions ${isMenuOpen && !isScrolled ? 'is-open' : ''}`}
              role="menu"
              aria-label="Quick Actions"
              aria-hidden={!isMenuOpen || isScrolled}
            >
              {renderBurgerIconButtons('horizontal')}
            </div>

            {/* Island 3: Burger Menu Bubble */}
            <div className="nav-burger-bubble bubble-island">
              <button
                type="button"
                className={`hamburger-btn ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
              >
                <span className="hamburger-line line-1" />
                <span className="hamburger-line line-2" />
                <span className="hamburger-line line-3" />
              </button>
            </div>

            {/* Dynamic Scrolled Island Popover (only active in floating island scrolled mode) */}
            <div
              className={`nav-burger-popover ${isMenuOpen && isScrolled ? 'is-open' : ''}`}
              role="menu"
              aria-label="Quick Actions"
              aria-hidden={!isMenuOpen || !isScrolled}
            >
              {renderBurgerIconButtons('vertical')}
            </div>
          </div>
        </div>

        {/* Dynamic Island Minimized Top Indicator Bar (non-reduced motion, scrolled dynamic-island mode only) */}
        {isScrolled && !isReducedMotion && (
          <button
            type="button"
            className={`nav-minimized-trigger ${isNavMinimized ? 'is-visible' : ''}`}
            aria-label="Expand navigation bar"
            title="Expand navigation bar"
            tabIndex={isNavMinimized ? 0 : -1}
            aria-hidden={!isNavMinimized}
            onMouseEnter={() => {
              setIsMinimized(false);
              isHoveredRef.current = true;
              clearMinimizeTimer();
            }}
            onClick={() => {
              setIsMinimized(false);
              isHoveredRef.current = true;
              clearMinimizeTimer();
            }}
            onFocus={() => {
              setIsMinimized(false);
              isHoveredRef.current = true;
              clearMinimizeTimer();
            }}
          >
            <span className="nav-minimized-bar" />
          </button>
        )}
      </header>
    </>
  );
}
