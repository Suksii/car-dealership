import { describe, it, expect } from "vitest";
import { formatPrice, formatKm, kwToHp, pluralSr, formatDate } from "./format";

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
});
