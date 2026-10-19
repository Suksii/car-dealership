import { describe, it, expect } from "vitest";
import { activeFilterChips, filtersToQuery, parseFilters } from "./filters";

const cat = {
  makes: [{ slug: "bmw", name: "BMW" }],
  models: [{ slug: "serija-3", name: "Serija 3" }],
  cities: [{ slug: "podgorica", name: "Podgorica" }],
};

describe("activeFilterChips", () => {
  it("nema čipova bez filtera", () => {
    expect(activeFilterChips(parseFilters({}), cat)).toEqual([]);
  });

  it("marka i model dobijaju imena, uklanjanje marke uklanja i model", () => {
    const f = parseFilters({ marka: "bmw", model: "serija-3", grad: "podgorica", page: "3" });
    const chips = activeFilterChips(f, cat);
    expect(chips.map((c) => c.label)).toEqual(["BMW", "Serija 3", "Podgorica"]);
    expect(chips[0].query).toBe("grad=podgorica");
    expect(chips[1].query).toBe("marka=bmw&grad=podgorica");
    expect(chips[2].query).toBe("marka=bmw&model=serija-3");
  });

  it("opseg cijene je jedan čip, pojedinačna granica ima od/do", () => {
    expect(activeFilterChips(parseFilters({ cijena_od: "5000", cijena_do: "10000" }), cat)).toMatchObject([
      { key: "priceMin", query: "" },
    ]);
    expect(activeFilterChips(parseFilters({ cijena_do: "10000" }), cat)[0].label).toMatch(/^do /);
  });

  it("zadržava sort u query-ju čipa", () => {
    const f = parseFilters({ gorivo: "diesel", sort: "price_asc" });
    expect(activeFilterChips(f, cat)[0].query).toBe(filtersToQuery({ sort: "price_asc" }));
  });
});
