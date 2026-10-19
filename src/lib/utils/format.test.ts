import { describe, it, expect } from "vitest";
import { formatPrice, formatKm, kwToHp, pluralSr, formatDate, formatRelativeDay } from "./format";

describe("format", () => {
  it("formatira cijenu bez centi sa eurom", () => {
    expect(formatPrice(11900)).toMatch(/^11[.  ]900 €$/);
  });
  it("formatira kilometražu", () => {
    expect(formatKm(154000)).toMatch(/^154[.  ]000 km$/);
  });
  it("pretvara kW u KS", () => {
    expect(kwToHp(110)).toBe(150);
  });
  it("bira pravilan oblik množine", () => {
    const forms: [string, string, string] = ["oglas", "oglasa", "oglasa"];
    expect(pluralSr(1, forms)).toBe("oglas");
    expect(pluralSr(3, forms)).toBe("oglasa");
    expect(pluralSr(11, forms)).toBe("oglasa");
  });
  it("vraća fallback za nevalidan datum", () => {
    expect(formatDate(null, undefined, "-")).toBe("-");
    expect(formatDate("nije datum", undefined, "-")).toBe("-");
  });

  it("relativno vrijeme na nivou dana, ijekavski", () => {
    const now = new Date("2026-10-19T12:00:00Z").getTime();
    const ago = (d: number) => new Date(now - d * 86400_000);
    expect(formatRelativeDay(ago(0), now)).toBe("danas");
    expect(formatRelativeDay(new Date(now - 3600_000 * 5), now)).toBe("danas");
    expect(formatRelativeDay(ago(1), now)).toBe("juče");
    expect(formatRelativeDay(ago(2), now)).toBe("prije 2 dana");
    expect(formatRelativeDay(ago(5), now)).toBe("prije 5 dana");
    expect(formatRelativeDay(ago(7), now)).toBe("prije 1 sedmicu");
    expect(formatRelativeDay(ago(15), now)).toBe("prije 2 sedmice");
    expect(formatRelativeDay(ago(40), now)).toBe("prije 1 mjesec");
    expect(formatRelativeDay(ago(70), now)).toBe("prije 2 mjeseca");
    expect(formatRelativeDay(ago(200), now)).toBe("prije 6 mjeseci");
    expect(formatRelativeDay(ago(400), now)).toBe("prije 1 godinu");
    expect(formatRelativeDay(null, now)).toBeNull();
    expect(formatRelativeDay(new Date(now + 86400_000), now)).toBe("danas");
  });
});
