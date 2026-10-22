import { describe, it, expect } from "vitest";
import { hashResetToken, isWellFormedToken, newResetToken } from "./resetToken";

describe("reset token", () => {
  it("novi token je ispravnog oblika i svaki put drugačiji", () => {
    const a = newResetToken();
    const b = newResetToken();
    expect(isWellFormedToken(a)).toBe(true);
    expect(a).not.toBe(b);
  });
  it("hash je stabilan SHA-256 hex i ne otkriva token", () => {
    const t = newResetToken();
    expect(hashResetToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashResetToken(t)).toBe(hashResetToken(t));
    expect(hashResetToken(t)).not.toContain(t);
  });
  it("odbija pogrešan oblik", () => {
    expect(isWellFormedToken("kratak")).toBe(false);
    expect(isWellFormedToken("a".repeat(42) + "!")).toBe(false);
    expect(isWellFormedToken(undefined)).toBe(false);
  });
});
