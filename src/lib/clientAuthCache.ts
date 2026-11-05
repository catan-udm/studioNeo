/**
 * Client-Side Auth Session Cache & Token Persistence
 * 
 * Prevents redundant database queries and round-trips to /api/auth/me across
 * rapid page transitions and concurrent components (e.g. StudioNav + LandingClient).
 * Retains auth tokens in browser localStorage until explicit logout or token expiration.
 */

export const AUTH_STORAGE_KEY = 'studioneo_auth_session';
export const AUTH_TOKEN_KEY = 'studioneo_auth_token';

export interface AuthSubscriber {
  id: number;
  email: string;
  handle?: string;
  displayName?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  is_verified: boolean;
  systemRole?: 'user' | 'curator' | 'admin';
  artistDistinction?: 'none' | 'artist' | 'featured' | 'partner';
  role?: string;
  tier?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'trialing';
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
  token?: string;
  error?: string;
}

interface CacheEntry {
  data: AuthSessionResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 25000; // 25 seconds in-memory TTL
let cacheEntry: CacheEntry | null = null;
let inflightPromise: Promise<AuthSessionResponse> | null = null;

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredAuthSession(): AuthSessionResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as AuthSessionResponse;
    }
  } catch {}
  return null;
}

export function setStoredAuth(data: AuthSessionResponse, token?: string): void {
  cacheEntry = { data, timestamp: Date.now() };
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    const tokenToStore = token || data.token;
    if (tokenToStore) {
      localStorage.setItem(AUTH_TOKEN_KEY, tokenToStore);
    }
  } catch {}
}

export function clearStoredAuth(): void {
  cacheEntry = null;
  inflightPromise = null;
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
}

export async function getAuthenticatedSession(options: { forceRefresh?: boolean } = {}): Promise<AuthSessionResponse> {
  const now = Date.now();

  // 1. Check in-memory cache
  if (!options.forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_TTL_MS) {
    return cacheEntry.data;
  }

  // 2. Initialize from persistent localStorage if in-memory cache is cold
  if (!options.forceRefresh && !cacheEntry && typeof window !== 'undefined') {
    const stored = getStoredAuthSession();
    if (stored && stored.authenticated) {
      cacheEntry = { data: stored, timestamp: now };
    }
  }

  if (inflightPromise && !options.forceRefresh) {
    return inflightPromise;
  }

  inflightPromise = (async () => {
    try {
      const headersInit: Record<string, string> = {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      };

      const token = getStoredAuthToken();
      if (token) {
        headersInit['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: headersInit,
      });

      if (!res.ok) {
        // If server returns error, retain persistent session if available instead of instantly logging out
        const stored = getStoredAuthSession();
        if (stored && stored.authenticated) {
          cacheEntry = { data: stored, timestamp: Date.now() };
          return stored;
        }

        const fallback: AuthSessionResponse = { authenticated: false, subscriber: null, perks: [] };
        cacheEntry = { data: fallback, timestamp: Date.now() };
        clearStoredAuth();
        return fallback;
      }

      const data: AuthSessionResponse = await res.json();

      if (data.authenticated) {
        setStoredAuth(data, data.token || token || undefined);
      } else {
        cacheEntry = { data, timestamp: Date.now() };
        clearStoredAuth();
      }

      return data;
    } catch {
      // On network failure, retain existing stored auth if valid
      const stored = getStoredAuthSession();
      if (stored && stored.authenticated) {
        cacheEntry = { data: stored, timestamp: Date.now() };
        return stored;
      }

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
  setStoredAuth(data);
}
