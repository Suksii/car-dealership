import { describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("pušta do limita pa blokira do isteka prozora", () => {
    vi.useFakeTimers();
    const key = `t:${Math.random()}`;
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    const third = rateLimit(key, 2, 1000);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSec).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    vi.useRealTimers();
  });
  it("clientIp uzima prvi x-forwarded-for", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
