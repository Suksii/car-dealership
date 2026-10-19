import { describe, it, expect } from "vitest";
import { activeFilterChips, countActiveFilters, filtersToQuery, parseFilters } from "./filters";

const cat = {
  makes: [{ slug: "audi", name: "Audi" }],
  models: [
    { slug: "a3", name: "A3" },
    { slug: "a4", name: "A4" },
  ],
  cities: [{ slug: "podgorica", name: "Podgorica" }],
};

describe("parseFilters / filtersToQuery", () => {
  it("čita više vrijednosti razdvojenih zarezom, bez duplikata i nepoznatih", () => {
    const f = parseFilters({ marka: "audi", model: "a3,a4,a3, ", gorivo: "diesel,petrol,nepostoji" });
    expect(f.model).toEqual(["a3", "a4"]);
    expect(f.fuel).toEqual(["diesel", "petrol"]);
    expect(filtersToQuery(f)).toBe("marka=audi&model=a3%2Ca4&gorivo=diesel%2Cpetrol");
  });

  it("prazna lista nije aktivan filter", () => {
    expect(parseFilters({ gorivo: "nepostoji" }).fuel).toBeUndefined();
    expect(countActiveFilters({ model: [], fuel: ["diesel"] })).toBe(1);
  });
});

describe("activeFilterChips", () => {
  it("nema čipova bez filtera", () => {
    expect(activeFilterChips(parseFilters({}), cat)).toEqual([]);
  });

  it("po jedan čip za svaki model; uklanjanje jednog ostavlja ostale, uklanjanje marke briše i modele", () => {
    const f = parseFilters({ marka: "audi", model: "a3,a4", grad: "podgorica", page: "3" });
    const chips = activeFilterChips(f, cat);
    expect(chips.map((c) => c.label)).toEqual(["Audi", "A3", "A4", "Podgorica"]);
    expect(chips[0].query).toBe("grad=podgorica");
    expect(chips[1].query).toBe("marka=audi&model=a4&grad=podgorica");
    expect(chips[2].query).toBe("marka=audi&model=a3&grad=podgorica");
    expect(chips[3].query).toBe("marka=audi&model=a3%2Ca4");
  });

  it("opseg cijene je jedan čip, pojedinačna granica ima od/do", () => {
    expect(activeFilterChips(parseFilters({ cijena_od: "5000", cijena_do: "10000" }), cat)).toMatchObject([
      { id: "price", query: "" },
    ]);
    expect(activeFilterChips(parseFilters({ cijena_do: "10000" }), cat)[0].label).toMatch(/^do /);
  });

  it("zadržava sort u query-ju čipa", () => {
    const f = parseFilters({ gorivo: "diesel", sort: "price_asc" });
    expect(activeFilterChips(f, cat)[0].query).toBe(filtersToQuery({ sort: "price_asc" }));
  });
});
