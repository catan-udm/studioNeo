'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/clientAuthCache';
import { ArchiveApp } from '@/components/archive/ArchiveApp';
import { type ArtistPage } from '@/components/archive/ArtistSwitcher';
import StudioLanding from '@/components/landing/StudioLanding';
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

  if (rawArtist && isArtistPage(rawArtist)) {
    return <ArchiveApp initialArtist={rawArtist} />;
  }

  return <StudioLanding />;
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
