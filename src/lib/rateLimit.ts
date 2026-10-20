/**
 * Minimal in-memory sliding-window rate limiter keyed by an arbitrary string (e.g. client IP).
 * State is per server instance, which is adequate for abuse mitigation on a small deployment.
 */
const buckets = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((ts) => now - ts < windowMs);

  if (recent.length >= limit) {
    buckets.set(key, recent);
    return true;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup to keep the map bounded
  if (buckets.size > 5000) {
    for (const [k, stamps] of buckets) {
      if (stamps.every((ts) => now - ts >= windowMs)) buckets.delete(k);
    }
  }

  return false;
}
