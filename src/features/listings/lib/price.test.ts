import { describe, it, expect } from "vitest";
import { isPriceDropped, nextPreviousPrice } from "./price";

const base = { priceEur: 10000, previousPriceEur: null, priceOnRequest: false };

describe("nextPreviousPrice", () => {
  it("pamti staru cijenu pri sniženju", () => {
    expect(nextPreviousPrice(base, { priceEur: 9000, priceOnRequest: false })).toEqual({ previousPriceEur: 10000 });
  });
  it("više sniženja zaredom zadržava najvišu cijenu", () => {
    expect(
      nextPreviousPrice(
        { ...base, priceEur: 9000, previousPriceEur: 10000 },
        { priceEur: 8500, priceOnRequest: false },
      ),
    ).toEqual({ previousPriceEur: 10000 });
  });
  it("poskupljenje briše oznaku, ista cijena ne dira ništa", () => {
    expect(nextPreviousPrice(base, { priceEur: 11000, priceOnRequest: false })).toEqual({ previousPriceEur: null });
    expect(nextPreviousPrice(base, { priceEur: 10000, priceOnRequest: false })).toBeUndefined();
  });
  it("cijena na upit nema sniženje", () => {
    expect(nextPreviousPrice(base, { priceEur: 0, priceOnRequest: true })).toEqual({ previousPriceEur: null });
    expect(
      nextPreviousPrice({ ...base, priceOnRequest: true, priceEur: 0 }, { priceEur: 9000, priceOnRequest: false }),
    ).toEqual({
      previousPriceEur: null,
    });
  });
});

describe("isPriceDropped", () => {
  const now = new Date("2026-10-22T12:00:00Z").getTime();
  const l = { priceEur: 9000, previousPriceEur: 10000, priceOnRequest: false };
  it("važi 30 dana od promjene", () => {
    expect(isPriceDropped({ ...l, priceChangedAt: new Date(now - 5 * 86400_000) }, now)).toBe(true);
    expect(isPriceDropped({ ...l, priceChangedAt: new Date(now - 31 * 86400_000) }, now)).toBe(false);
  });
  it("bez stare cijene ili sa višom trenutnom nema oznake", () => {
    expect(isPriceDropped({ ...l, previousPriceEur: null, priceChangedAt: new Date(now) }, now)).toBe(false);
    expect(isPriceDropped({ ...l, previousPriceEur: 8000, priceChangedAt: new Date(now) }, now)).toBe(false);
  });
});
