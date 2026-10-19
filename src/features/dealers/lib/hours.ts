/** Radno vrijeme placa: ključevi dana u jsonb koloni `dealers.working_hours`. */
export const DAYS = [
  ["mon", "Ponedjeljak"],
  ["tue", "Utorak"],
  ["wed", "Srijeda"],
  ["thu", "Četvrtak"],
  ["fri", "Petak"],
  ["sat", "Subota"],
  ["sun", "Nedjelja"],
] as const;

export type DayKey = (typeof DAYS)[number][0];
export type WorkingHours = Partial<Record<DayKey, string | null>>;

/** Iz FormData polja hours_mon… u objekat; null ako ništa nije uneseno. */
export function hoursFromForm(get: (key: string) => string | undefined): WorkingHours | null {
  const out: WorkingHours = {};
  let any = false;
  for (const [key] of DAYS) {
    const v = get(`hours_${key}`)?.trim();
    out[key] = v || null;
    if (v) any = true;
  }
  return any ? out : null;
}

export function hasHours(h: WorkingHours | null | undefined): h is WorkingHours {
  return !!h && DAYS.some(([k]) => !!h[k]);
}
