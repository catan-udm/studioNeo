'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { usePathname } from 'next/navigation';
import './pageTransition.css';

interface PageTransitionContextType {
  isNavigating: boolean;
  startNavigation: (destination?: string) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  isNavigating: false,
  startNavigation: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [currentPath, setCurrentPath] = useState(pathname);

  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronously resolve navigation when pathname changes during render
  if (currentPath !== pathname) {
    setCurrentPath(pathname);
    setIsNavigating(false);
    setProgress(100);
  }

  const startNavigation = useCallback((destination?: string) => {
    // If navigating to the exact same path, do not trigger transition
    if (destination && destination === window.location.pathname) {
      return;
    }

    setIsNavigating(true);
    setShowProgressBar(true);
    setProgress(32);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);

    // Incrementally advance progress bar while waiting for the route payload
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 68) return prev + Math.random() * 12 + 6;
        if (prev < 88) return prev + Math.random() * 3 + 1;
        return prev;
      });
    }, 160);

    // Safety timeout: reset after 5s if route stalls
    navigationTimeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
      setProgress(100);
      setTimeout(() => setShowProgressBar(false), 240);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, 5000);
  }, []);

  // When pathname changes, complete and dismiss the progress bar
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);

    const hideTimer = setTimeout(() => {
      setShowProgressBar(false);
      setProgress(0);
    }, 280);

    return () => clearTimeout(hideTimer);
  }, [pathname]);

  // Global click interception for immediate tactile feedback on link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Allow modified clicks (Ctrl, Cmd, Shift, Alt, middle-click) for default browser behavior
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      if (anchor.target && anchor.target !== '_self') return;

      const rawHref = anchor.getAttribute('href');
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.origin);
        if (targetUrl.origin !== window.location.origin) return;

        // If target path is different from current path, start transition immediately
        if (targetUrl.pathname !== window.location.pathname) {
          startNavigation(targetUrl.pathname);
        }
      } catch {
        // Ignore invalid URL
      }
    };

    const handlePopState = () => {
      startNavigation();
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, [startNavigation]);

  return (
    <PageTransitionContext.Provider value={{ isNavigating, startNavigation }}>
      {/* Top Edge Progress Indicator */}
      <div
        className={`page-top-progress-bar ${showProgressBar ? 'visible' : ''}`}
        aria-hidden="true"
      >
        <div
          className="page-top-progress-fill"
          style={{
            transform: `scaleX(${progress / 100})`,
            opacity: showProgressBar ? 1 : 0,
          }}
        />
      </div>

      {children}
    </PageTransitionContext.Provider>
  );
}

export function PageTransitionContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isNavigating } = usePageTransition();

  return (
    <div
      key={pathname}
      className={`page-transition-view ${isNavigating ? 'is-exiting' : 'is-entering'}`}
    >
      {children}
    </div>
  );
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransitionProvider>
      <PageTransitionContent>{children}</PageTransitionContent>
    </PageTransitionProvider>
  );
}
