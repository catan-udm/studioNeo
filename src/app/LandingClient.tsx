'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthenticatedSession } from '@/lib/clientAuthCache';
import { ArchiveApp } from '@/components/archive/ArchiveApp';

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

export default function LandingClient() {
  return (
    <>
      <Suspense fallback={null}>
        <OAuthRedirectWatcher />
      </Suspense>
      <ArchiveApp initialArtist="sankobite" />
    </>
  );
}
