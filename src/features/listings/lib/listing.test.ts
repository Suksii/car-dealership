import { describe, it, expect } from "vitest";
import { listingSchema, listingFormToObject, listingSlug, listingPath, newPublicId } from "./listing";

function fd(entries: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    if (Array.isArray(v)) v.forEach((x) => f.append(k, x));
    else f.append(k, v);
  }
  return f;
}

const valid = {
  makeId: "1", modelId: "6", year: "2016", mileageKm: "154000", condition: "used", fuel: "diesel",
  transmission: "manual", bodyType: "hatchback", priceEur: "11900", cityId: "1",
  images: JSON.stringify([{ key: "listings/2026/abc", width: 1600, height: 1200 }]), features: ["16", "17"],
};

describe("listingSchema", () => {
  it("prihvata ispravnu formu i pretvara stringove u brojeve", () => {
    const r = listingSchema.safeParse(listingFormToObject(fd(valid)));
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.year).toBe(2016);
      expect(r.data.features).toEqual([16, 17]);
      expect(r.data.images[0].key).toBe("listings/2026/abc");
      expect(r.data.customsCleared).toBe(false); // nečekiran checkbox ne šalje polje
    }
  });
  it("traži cijenu osim kad je 'na upit'", () => {
    expect(listingSchema.safeParse(listingFormToObject(fd({ ...valid, priceEur: "0" }))).success).toBe(false);
    expect(listingSchema.safeParse(listingFormToObject(fd({ ...valid, priceEur: "0", priceOnRequest: "on" }))).success).toBe(true);
  });
  it("odbija godište u budućnosti", () => {
    expect(listingSchema.safeParse(listingFormToObject(fd({ ...valid, year: "2099" }))).success).toBe(false);
  });
  it("prazna opciona polja postaju undefined", () => {
    const r = listingSchema.safeParse(listingFormToObject(fd({ ...valid, drive: "", engineCc: "" })));
    expect(r.success).toBe(true);
    if (r.success) { expect(r.data.drive).toBeUndefined(); expect(r.data.engineCc).toBeUndefined(); }
  });
});

describe("slug i putanja", () => {
  it("pravi čitljiv slug i URL", () => {
    expect(listingSlug("Volkswagen", "Golf", "2.0 TDI", 2016)).toBe("volkswagen-golf-2-0-tdi-2016");
    expect(listingPath("volkswagen-golf-2016", "a7k3m9")).toBe("/oglas/volkswagen-golf-2016-a7k3m9");
  });
  it("public id je kratak i bez dvosmislenih znakova", () => {
    const id = newPublicId();
    expect(id).toHaveLength(7);
    expect(id).toMatch(/^[a-z0-9]+$/);
    expect(id).not.toMatch(/[lo01]/);
  });
});
