/**
 * Jednostavan limiter po ključu (IP + radnja) u memoriji procesa. Dovoljan za jedan server;
 * za više instanci zamijeniti tabelom u Postgresu ili Redis-om, API ostaje isti.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = 0;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    lastSweep = now;
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  b.count++;
  return b.count <= limit
    ? { ok: true, retryAfterSec: 0 }
    : { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
}

/** IP iz zaglavlja proxyja (Cloudflare/nginx) ili "unknown". */
export function clientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
