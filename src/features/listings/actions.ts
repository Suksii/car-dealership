"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contactClicks, listings } from "@/db/schema";

const CONTACT = ["phone", "viber", "whatsapp", "email"] as const;
type ContactType = (typeof CONTACT)[number];

/** Statistika za plac: klik na telefon/Viber/WhatsApp. Ne baca ka klijentu. */
export async function trackContactClick(listingId: string, type: ContactType) {
  if (!CONTACT.includes(type)) return;
  try {
    const l = await db.query.listings.findFirst({ where: eq(listings.id, listingId), columns: { dealerId: true } });
    if (!l) return;
    await db.insert(contactClicks).values({ listingId, dealerId: l.dealerId, type });
  } catch {
    // statistika ne smije da sruši stranicu
  }
}

/** Brojač pregleda; poziva se jednom po učitavanju stranice oglasa. */
export async function trackView(listingId: string) {
  try {
    await db
      .update(listings)
      .set({ viewsCount: sql`${listings.viewsCount} + 1` })
      .where(eq(listings.id, listingId));
  } catch {
    // isto
  }
}
