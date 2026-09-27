/**
 * Client-Side Auth Session Cache
 * 
 * Prevents redundant database queries and round-trips to /api/auth/me across
 * rapid page transitions and concurrent components (e.g. StudioNav + LandingClient).
 */

export interface AuthSubscriber {
  id: number;
  email: string;
  is_verified: boolean;
  twoFactorActive: boolean;
  passkeyCount: number;
  linkedOAuth: string[];
  linkedAccounts?: Array<{ provider: string; created_at: string }>;
  created_at: string;
}

export interface AuthPerk {
  id: number;
  slug: string;
  title: string;
  description: string;
  unlocked_at: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  subscriber: AuthSubscriber | null;
  perks: AuthPerk[];
  error?: string;
}

interface CacheEntry {
  data: AuthSessionResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 25000; // 25 seconds TTL
let cacheEntry: CacheEntry | null = null;
let inflightPromise: Promise<AuthSessionResponse> | null = null;

export async function getAuthenticatedSession(options: { forceRefresh?: boolean } = {}): Promise<AuthSessionResponse> {
  const now = Date.now();

  if (!options.forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_TTL_MS) {
    return cacheEntry.data;
  }

  if (inflightPromise && !options.forceRefresh) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      });
      if (!res.ok) {
        const fallback: AuthSessionResponse = { authenticated: false, subscriber: null, perks: [] };
        cacheEntry = { data: fallback, timestamp: Date.now() };
        return fallback;
      }
      const data: AuthSessionResponse = await res.json();
      cacheEntry = { data, timestamp: Date.now() };
      return data;
    } catch {
      const fallback: AuthSessionResponse = { authenticated: false, subscriber: null, perks: [] };
      cacheEntry = { data: fallback, timestamp: Date.now() };
      return fallback;
    } finally {
      inflightPromise = null;
    }
  })();

  return inflightPromise;
}

export function invalidateAuthCache(): void {
  cacheEntry = null;
  inflightPromise = null;
}

export function setAuthCache(data: AuthSessionResponse): void {
  cacheEntry = { data, timestamp: Date.now() };
}
