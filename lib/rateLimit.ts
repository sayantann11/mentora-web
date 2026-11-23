import "server-only";

/**
 * Fixed-window, in-memory rate limiter keyed by e.g. `trial:<ipHash>`.
 * Per serverless instance only — good enough to blunt spam for a pilot together with
 * Turnstile + honeypot + DB constraints. Swap for Upstash/Redis if traffic grows (see SECURITY.md).
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfterSec: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, retryAfterSec: 0 };
}

export function _resetRateLimits() {
  buckets.clear();
}
