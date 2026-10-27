'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'studioNeo_saved_works';
const EVENT_NAME = 'studioNeo:favorites-changed';

export function getSavedWorkIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function setSavedWorkIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const unique = Array.from(new Set(ids));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: unique }));
  } catch {
    // Storage may be unavailable in private browsing
  }
}

export function toggleSavedWorkId(id: string): { saved: boolean; ids: string[] } {
  const current = getSavedWorkIds();
  const exists = current.includes(id);
  const next = exists ? current.filter((item) => item !== id) : [id, ...current];
  setSavedWorkIds(next);
  return { saved: !exists, ids: next };
}

export function useSavedWorks() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedWorkIds());

    const onUpdate = () => {
      setSavedIds(getSavedWorkIds());
    };

    window.addEventListener(EVENT_NAME, onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const res = toggleSavedWorkId(id);
    setSavedIds(res.ids);
    return res.saved;
  }, []);

  const isSaved = useCallback((id: string) => savedIds.includes(id), [savedIds]);

  return { savedIds, toggle, isSaved, count: savedIds.length };
}
