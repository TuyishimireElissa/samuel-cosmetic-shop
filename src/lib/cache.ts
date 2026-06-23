interface Entry<T> { data: T; at: number; ttl: number }
const store = new Map<string, Entry<any>>();
const MAX = 200;
export async function cached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 60): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && now - hit.at < hit.ttl * 1000) return hit.data as T;
  const data = await fetcher();
  if (store.size >= MAX) { const entries = [...store.entries()].sort((a, b) => a[1].at - b[1].at); for (let i = 0; i < Math.floor(MAX * 0.25); i++) store.delete(entries[i][0]); }
  store.set(key, { data, at: now, ttl: ttlSeconds });
  return data;
}
export function invalidate(prefix: string) { for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k); }
export function cacheKey(route: string, params: Record<string, any> = {}): string { const qs = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&"); return qs ? `${route}?${qs}` : route; }
export function withCache(res: Response, ttl = 60): Response { res.headers.set("Cache-Control", `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`); return res; }
