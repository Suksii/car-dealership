import { describe, expect, it } from "vitest";
import { hasHours, hoursFromForm } from "./hours";

describe("hoursFromForm", () => {
  it("vraća null kad ništa nije uneseno", () => {
    expect(hoursFromForm(() => "")).toBeNull();
    expect(hoursFromForm(() => undefined)).toBeNull();
  });
  it("trimuje i prazne dane postavlja na null", () => {
    const h = hoursFromForm((k) => (k === "hours_mon" ? " 08:00–16:00 " : ""));
    expect(h).toEqual({ mon: "08:00–16:00", tue: null, wed: null, thu: null, fri: null, sat: null, sun: null });
    expect(hasHours(h)).toBe(true);
  });
  it("hasHours je false za prazan objekat", () => {
    expect(hasHours({})).toBe(false);
    expect(hasHours(null)).toBe(false);
  });
});
