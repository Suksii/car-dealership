import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("prevodi naša slova u ASCII", () => {
    expect(slugify("Škoda Octavia")).toBe("skoda-octavia");
    expect(slugify("Đurđevdan ćevap žar")).toBe("djurdjevdan-cevap-zar");
  });
  it("zamjenjuje sve što nije slovo ili broj crticom i skida krajeve", () => {
    expect(slugify("  2.0 TDI / Highline! ")).toBe("2-0-tdi-highline");
  });
  it("vraća prazan string za prazan ulaz", () => {
    expect(slugify("")).toBe("");
  });
});
