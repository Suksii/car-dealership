import { describe, expect, it } from "vitest";
import { fillSeries, lastDays, localDay } from "./stats";

describe("localDay", () => {
  it("koristi lokalnu zonu, ne UTC", () => {
    // 23:30 UTC 31. marta je već 1. april u Podgorici (UTC+2 ljeti).
    expect(localDay(Date.UTC(2026, 2, 31, 23, 30))).toBe("2026-04-01");
    expect(localDay(Date.UTC(2026, 2, 31, 21, 30))).toBe("2026-03-31");
  });
});

describe("lastDays", () => {
  it("vraća n dana završno sa današnjim, preko granice mjeseca", () => {
    expect(lastDays(3, Date.UTC(2026, 2, 1, 12))).toEqual(["2026-02-27", "2026-02-28", "2026-03-01"]);
  });

  it("radi preko promjene ljetnog računanja vremena", () => {
    const days = lastDays(30, Date.UTC(2026, 3, 10, 12));
    expect(days).toHaveLength(30);
    expect(new Set(days).size).toBe(30);
    expect(days.at(-1)).toBe("2026-04-10");
  });
});

describe("fillSeries", () => {
  it("popunjava dane bez pregleda nulom", () => {
    expect(fillSeries(["2026-03-01", "2026-03-02"], [{ day: "2026-03-02", views: 4 }])).toEqual([
      { day: "2026-03-01", views: 0 },
      { day: "2026-03-02", views: 4 },
    ]);
  });
});
