'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import BikkoMark from './BikkoMark';

type TabKey = 'studio' | 'projects' | 'about' | 'dashboard';

export default function StudioNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  // Scroll state for water droplet detach / rejoin
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const isNavigatingRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check current session status
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated) {
          setIsAuthenticated(true);
          setUserEmail(data.subscriber?.email || 'Active Subscriber');
          return;
        }
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

  // Scroll listener for liquid droplet detachment to floating island
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = isNavigatingRef.current ? false : window.scrollY > 40;
          setIsScrolled((prev) => {
            return prev === scrolled ? prev : scrolled;
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Check initial scroll state
    const initialStateTask = window.requestAnimationFrame(() => {
      if (window.scrollY > 40) setIsScrolled(true);
    });

    return () => {
      window.cancelAnimationFrame(initialStateTask);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Handle Sign Out
  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed even if request fails
    } finally {
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
    setIsMenuOpen(false);
  }, [pathname, isScrolled]);

  const isHome = pathname === '/';
  const isProjects = pathname === '/projects';
  const isAbout = pathname === '/about';
  const isAuth = pathname === '/login' || pathname === '/register';
  const isDashboard = pathname === '/dashboard';

  const [activeTab, setActiveTab] = useState<TabKey>('studio');
  const sliderRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<{ [key in TabKey]?: HTMLAnchorElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // Synchronize activeTab with current route
  useEffect(() => {
    const routeTab = pathname === '/about'
      ? 'about'
      : pathname === '/projects'
        ? 'projects'
        : pathname === '/dashboard'
          ? 'dashboard'
          : pathname === '/'
            ? 'studio'
            : null;

    if (routeTab) {
      const activeTabTask = window.setTimeout(() => setActiveTab(routeTab), 0);
      return () => window.clearTimeout(activeTabTask);
    }
  }, [pathname]);

  // Measure and align the Apple sliding capsule indicator
  // Normalizes by scale factor to eliminate ancestor transform distortion (e.g. scale(0.92) on mobile)
  const updateIndicator = useCallback(() => {
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
    updateIndicator();
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
    }
  };

  return (
    <>
      <header
        className={`studio-nav-header ${isScrolled ? 'is-scrolled' : ''}`}
        role="banner"
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
                }
              }}
            >
              <div className="studio-nav-logo-wrap">
                <BikkoMark width={44} height={38} />
              </div>
            </Link>
          </div>

          {/* Island 2: Slider Bubble in the Middle */}
          <div className="studio-nav-center">
            <nav
              ref={sliderRef}
              className="studio-nav-slider bubble-island"
              aria-label="Main Navigation"
            >
              {/* Apple Sliding Capsule Indicator */}
              <div
                className="nav-slider-indicator"
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
                onClick={(e) => handleTabClick(e, 'studio', '/')}
              >
                Studio
              </Link>
              <Link
                ref={(el) => {
                  tabRefs.current['projects'] = el;
                }}
                href="/projects"
                prefetch={true}
                className={`nav-pill ${activeTab === 'projects' ? 'active' : ''}`}
                aria-current={activeTab === 'projects' ? 'page' : undefined}
                onClick={(e) => handleTabClick(e, 'projects', '/projects')}
              >
                Projects
              </Link>
              <Link
                ref={(el) => {
                  tabRefs.current['about'] = el;
                }}
                href="/about"
                prefetch={true}
                className={`nav-pill ${activeTab === 'about' ? 'active' : ''}`}
                aria-current={activeTab === 'about' ? 'page' : undefined}
                onClick={(e) => handleTabClick(e, 'about', '/about')}
              >
                About
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
                  onClick={(e) => handleTabClick(e, 'dashboard', '/dashboard')}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section: Action Buttons & Island 3: Burger Menu Bubble */}
          <div className="studio-nav-right" ref={menuRef}>
            {/* Static Nav Bar Actions (revealed when burger button is clicked on static nav bar) */}
            <div
              className={`nav-static-actions ${isMenuOpen && !isScrolled ? 'is-open' : ''}`}
              aria-hidden={!isMenuOpen || isScrolled}
            >
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    className="nav-action-btn nav-action-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="nav-action-btn nav-action-secondary"
                    aria-label="Sign Out"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    prefetch={true}
                    className="nav-action-btn nav-action-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    prefetch={true}
                    className="nav-action-btn nav-action-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
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

            {/* Floating Island Dropdown (active when isScrolled and isMenuOpen) */}
            <div
              className={`nav-island-dropdown ${isMenuOpen && isScrolled ? 'is-open' : ''}`}
              role="menu"
              aria-hidden={!isMenuOpen || !isScrolled}
            >
              {isAuthenticated ? (
                <div className="nav-dropdown-content">
                  {userEmail && (
                    <div className="nav-dropdown-user">
                      <span className="nav-dropdown-badge">Subscriber</span>
                      <span className="nav-dropdown-email">{userEmail}</span>
                    </div>
                  )}
                  <Link
                    href="/dashboard"
                    prefetch={true}
                    className="nav-dropdown-btn nav-dropdown-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="nav-dropdown-btn nav-dropdown-secondary"
                  >
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              ) : (
                <div className="nav-dropdown-content">
                  <Link
                    href="/login"
                    prefetch={true}
                    className="nav-dropdown-btn nav-dropdown-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    prefetch={true}
                    className="nav-dropdown-btn nav-dropdown-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
