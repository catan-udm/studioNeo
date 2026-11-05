'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthenticatedSession, type AuthSubscriber } from '@/lib/clientAuthCache';
import { ArchiveApp } from '@/components/archive/ArchiveApp';
import { type ArtistPage } from '@/components/archive/ArtistSwitcher';
import StudioLanding from '@/components/landing/StudioLanding';
import InstagramFeed from '@/components/feed/InstagramFeed';
import './landing.css';

function OAuthRedirectWatcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const linked = searchParams.get('linked');
    const error = searchParams.get('error');
    if (!linked && !error) return;

    getAuthenticatedSession()
      .then((data) => {
        if (data?.authenticated) {
          router.replace('/dashboard' + window.location.search);
        }
      })
      .catch(() => {});
  }, [searchParams, router]);

  return null;
}

const VALID_ARTIST_PAGES: readonly ArtistPage[] = [
  'sankobite',
  'rella',
  'tamimoon',
  'yoneyamai',
  'mikapikazo',
  'dinoillus',
  'lam',
  'dolman',
  'tatamipi',
  'askziye',
  'dora',
  'kaduise',
  'kda',
];

function isArtistPage(val: string): val is ArtistPage {
  return (VALID_ARTIST_PAGES as readonly string[]).includes(val);
}

function LandingContent() {
  const searchParams = useSearchParams();
  const rawArtist = searchParams.get('artist')?.toLowerCase() || '';
  const viewMode = searchParams.get('view')?.toLowerCase() || '';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthSubscriber | null>(null);
  const [forceAtelier, setForceAtelier] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    getAuthenticatedSession()
      .then((data) => {
        if (!active) return;
        setIsAuthenticated(Boolean(data?.authenticated));
        setCurrentUser(data?.subscriber || null);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (rawArtist && isArtistPage(rawArtist)) {
    return <ArchiveApp initialArtist={rawArtist} />;
  }

  // When logged in, greet users with the Instagram-style infinite scrolling feed
  // of Featured & Partnered artists (excluding normal artists)
  if (isAuthenticated && !forceAtelier && viewMode !== 'atelier') {
    return (
      <InstagramFeed
        currentUser={currentUser}
        onSwitchToAtelier={() => setForceAtelier(true)}
      />
    );
  }

  return (
    <>
      {isAuthenticated && (forceAtelier || viewMode === 'atelier') && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
          }}
        >
          <button
            type="button"
            onClick={() => setForceAtelier(false)}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '13px',
              background: '#6366f1',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
              cursor: 'pointer',
            }}
          >
            ← Back to Curated Feed
          </button>
        </div>
      )}
      <StudioLanding />
    </>
  );
}

export default function LandingClient() {
  return (
    <>
      <Suspense fallback={null}>
        <OAuthRedirectWatcher />
        <LandingContent />
      </Suspense>
    </>
  );
}
