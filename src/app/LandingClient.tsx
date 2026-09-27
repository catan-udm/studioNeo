'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './landing.css';

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  color: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/1デビルじゃないもん.gif'), alt: 'Not A Devil', color: '#c496ff' },
  { id: 2, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/2デビルじゃないもん.gif'), alt: 'Not A Devil', color: '#f4cc7f' },
  { id: 3, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/3デビルじゃないもん.gif'), alt: 'Not A Devil', color: '#ff9d96' },
  { id: 4, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/アニマル.gif'), alt: 'Animal', color: '#ff3380' },
  { id: 5, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ゴーストルール.gif'), alt: 'Ghost Rule', color: '#737373' },
  { id: 6, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/サラマンダー.gif'), alt: 'Salamander', color: '#ac332b' },
  { id: 7, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/シンデレラ.gif'), alt: 'Cinderella', color: '#e2750d' },
  { id: 8, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ゾンビ.gif'), alt: 'Zombie', color: '#bffc3f' },
  { id: 9, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/パラサイト.gif'), alt: 'Parasite', color: '#d99af0' },
  { id: 10, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ヒバナ.gif'), alt: 'Hibana', color: '#344553' },
  { id: 11, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ラビットホール.gif'), alt: 'Rabbit Hole', color: '#f2479d' },
  { id: 12, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/ヴァンパイア.gif'), alt: 'Vampire', color: '#8d1409' },
  { id: 13, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/乙女解剖.gif'), alt: 'Otome Dissection', color: '#7e7f77' },
  { id: 14, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/2nan.gif'), alt: 'Project Volt', color: '#FCF6BD' },
  { id: 15, src: encodeURI('https://bikkostudio.blob.core.windows.net/gifs/HERO.gif'), alt: 'HERO', color: '#A9DEF9' },
];

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

function ImageWithFallback({ src, alt, className, style, ...rest }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  if (didError) {
    return (
      <div className={`gallery-image-fallback ${className || ''}`} style={style}>
        <span role="img" aria-label="Error loading image">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={240}
      height={240}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  );
}

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authenticated, setAuthenticated] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const tileMetaRef = useRef<Map<number, { revealedAt: number; maxExpiresAt: number }>>(new Map());

  // Asynchronous non-blocking session check
  useEffect(() => {
    fetch('/api/auth/me', {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          const linked = searchParams.get('linked');
          const error = searchParams.get('error');
          if (linked || error) {
            router.replace('/dashboard' + window.location.search);
          }
        }
      })
      .catch(() => { });
  }, [searchParams, router]);

  // Screen size & pointer detection
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)'
    );
    const initialDesktopTask = window.requestAnimationFrame(() => {
      setIsDesktop(mediaQuery.matches);
    });

    const onMediaChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      window.cancelAnimationFrame(initialDesktopTask);
      mediaQuery.removeEventListener('change', onMediaChange);
    };
  }, []);

  // Autonomous random appear & autohide cycles on mobile/tablet (no user action or button needed)
  useEffect(() => {
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    if (isDesktop) {
      tileMetaRef.current.clear();
      initTimer = setTimeout(() => {
        setRevealedIds([]);
      }, 0);
      return () => {
        if (initTimer) clearTimeout(initTimer);
      };
    }

    const tileMeta = tileMetaRef.current;
    const now = Date.now();

    // Start with 2 to 3 randomly selected visible tiles on mount
    const shuffled = [...galleryItems]
      .map((item) => item.id)
      .sort(() => Math.random() - 0.5);
    const initialCount = 2 + Math.floor(Math.random() * 2);
    const initialPicks = shuffled.slice(0, initialCount);

    initialPicks.forEach((id, index) => {
      // Stagger so they become eligible and expire organically at different moments
      tileMeta.set(id, {
        revealedAt: now - index * 600,
        maxExpiresAt: now + 2000 + index * 800 + Math.random() * 1200,
      });
    });

    initTimer = setTimeout(() => {
      setRevealedIds(initialPicks);
    }, 0);

    const cycleInterval = window.setInterval(() => {
      const currentTime = Date.now();

      setRevealedIds((currentRevealed) => {
        let hasChanges = false;
        const surviving = [...currentRevealed];

        // 1. Hard expiration: remove any tiles that reached their max lifespan ceiling
        for (let i = surviving.length - 1; i >= 0; i--) {
          const id = surviving[i];
          const meta = tileMeta.get(id);
          if (meta && currentTime >= meta.maxExpiresAt) {
            surviving.splice(i, 1);
            tileMeta.delete(id);
            hasChanges = true;
          }
        }

        // 2. Truly random expiration: running GIFs don't need to reach max concurrent to expire!
        // Any running GIF visible for at least 1.1s is eligible to randomly expire.
        const eligibleToExpire = surviving.filter((id) => {
          const meta = tileMeta.get(id);
          return meta && currentTime - meta.revealedAt >= 1100;
        });

        // If there are at least 2 active tiles and we have eligible ones, roll a random chance to expire one
        if (surviving.length >= 2 && eligibleToExpire.length > 0) {
          // Higher chance if 4+ are active, moderate chance for 2-3 active tiles
          const expireChance = surviving.length >= 4 ? 0.7 : 0.38;
          if (Math.random() < expireChance) {
            const randomPick = eligibleToExpire[Math.floor(Math.random() * eligibleToExpire.length)];
            const index = surviving.indexOf(randomPick);
            if (index !== -1) {
              surviving.splice(index, 1);
              tileMeta.delete(randomPick);
              hasChanges = true;
            }
          }
        }

        // 3. Organic random reveal: maintain a natural range of 2 to 4 active tiles
        const minTarget = 2;
        const maxTarget = 4;
        const unrevealed = galleryItems
          .map((item) => item.id)
          .filter((id) => !surviving.includes(id));

        if (unrevealed.length > 0) {
          const shouldAdd =
            surviving.length < minTarget ||
            (surviving.length < maxTarget && Math.random() < 0.45);

          if (shouldAdd) {
            const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            surviving.push(pick);
            tileMeta.set(pick, {
              revealedAt: currentTime,
              maxExpiresAt: currentTime + 2600 + Math.random() * 2400,
            });
            hasChanges = true;
          }
        }

        return hasChanges ? surviving : currentRevealed;
      });
    }, 480);

    return () => {
      window.clearInterval(cycleInterval);
      tileMeta.clear();
    };
  }, [isDesktop]);

  // Optional tap interaction on mobile/tablet: toggle tile manually while maintaining autohide
  const handleTileClick = useCallback((id: number) => {
    if (isDesktop) return;

    setRevealedIds((current) => {
      const tileMeta = tileMetaRef.current;
      if (current.includes(id)) {
        tileMeta.delete(id);
        return current.filter((item) => item !== id);
      } else {
        // Reveal with random duration before autohiding
        tileMeta.set(id, {
          revealedAt: Date.now(),
          maxExpiresAt: Date.now() + 2800 + Math.random() * 2000,
        });
        return [...current, id];
      }
    });
  }, [isDesktop]);

  return (
    <main id="main-content" className="landing-page">
      <section id="projects" className="landing-hero" aria-labelledby="landing-title">
        <div className="code-art">
          <div className="code-art-grid" role="region" aria-label="Kinetic animation art grid">
            {galleryItems.map((item) => {
              const isSpan2 = item.id === 15;
              const isRevealed = revealedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Preview kinetic motion: ${item.alt}`}
                  className={`code-art-tile ${isSpan2 ? 'code-art-tile-wide' : ''} ${isDesktop ? 'code-art-hover' : 'code-art-touch'
                    }`}
                  onClick={() => handleTileClick(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTileClick(item.id);
                    }
                  }}
                >
                  <ImageWithFallback src={item.src} alt={item.alt} className="gallery-image" />
                  <div
                    className="code-art-overlay"
                    style={{
                      backgroundColor: item.color,
                      ...(!isDesktop ? { opacity: isRevealed ? 0 : 1 } : {}),
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="landing-content">
          <div id="about" className="landing-copy">
            <h1 id="landing-title">bikko.studio</h1>
            <p>Go ahead and say just a little more about what you do.</p>
          </div>
          <div className="landing-actions" role="group" aria-label="Primary landing actions">
            {authenticated ? (
              <>
                <Link href="/dashboard" className="landing-button landing-button-primary">
                  Go to Dashboard
                </Link>
                <Link href="/login" className="landing-button landing-button-secondary">
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="landing-button landing-button-primary">
                  Sign Up
                </Link>
                <Link href="/login" className="landing-button landing-button-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function LandingClient() {
  return (
    <Suspense fallback={<main id="main-content" className="landing-page" />}>
      <LandingContent />
    </Suspense>
  );
}
