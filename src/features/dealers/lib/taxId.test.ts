import { describe, it, expect } from "vitest";
import { normalizeTaxId } from "./taxId";

describe("normalizeTaxId", () => {
  it("prihvata 8 cifara, sa razmacima, tačkama ili crticama", () => {
    expect(normalizeTaxId("02012345")).toBe("02012345");
    expect(normalizeTaxId(" 02 012 345 ")).toBe("02012345");
    expect(normalizeTaxId("02.012-345")).toBe("02012345");
  });
  it("odbija pogrešnu dužinu i slova", () => {
    expect(normalizeTaxId("1234567")).toBeNull();
    expect(normalizeTaxId("123456789")).toBeNull();
    expect(normalizeTaxId("0201234A")).toBeNull();
    expect(normalizeTaxId("")).toBeNull();
    expect(normalizeTaxId(undefined)).toBeNull();
  });
});
