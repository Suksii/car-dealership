import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeNext";

describe("safeNextPath", () => {
  it("propušta relativne putanje", () => {
    expect(safeNextPath("/plac")).toBe("/plac");
    expect(safeNextPath("/automobili?marka=bmw")).toBe("/automobili?marka=bmw");
  });
  it("odbija open redirect oblike", () => {
    for (const bad of [
      "//evil.com",
      "/\\evil.com",
      "https://evil.com",
      "evil.com",
      "",
      undefined,
      "/x\r\nLocation: y",
    ]) {
      expect(safeNextPath(bad)).toBe("/nalog");
    }
  });
});
