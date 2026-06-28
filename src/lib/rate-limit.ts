// Simple in-memory rate limiter for API routes.
// On Vercel serverless, this is per-instance — not perfect, but raises the bar
// against casual enumeration. For production-grade protection, use Vercel KV
// or Upstash rate limiter.

interface Bucket { count: number; resetAt: number }
const store = new Map<string, Bucket>();
const MAX = 20;          // max requests
const WINDOW_MS = 60_000; // per 60 seconds

export function rateLimit(key: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + WINDOW_MS;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: MAX - 1, resetAt };
  }
  entry.count++;
  if (entry.count > MAX) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }
  return { ok: true, remaining: MAX - entry.count, resetAt: entry.resetAt };
}

// Cleanup old entries periodically to avoid memory growth
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }, 5 * 60 * 1000).unref?.();
}
