"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { contactClicks, listings } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { LOCAL_DAY_SQL } from "@/features/dealer-panel/lib/stats";

const CONTACT = ["phone", "viber", "whatsapp", "email"] as const;
type ContactType = (typeof CONTACT)[number];
const uuid = z.uuid();

/** Statistika za plac: klik na telefon/Viber/WhatsApp. Najviše 5 po IP-u i oglasu na sat. Ne baca ka klijentu. */
export async function trackContactClick(listingId: string, type: ContactType) {
  if (!CONTACT.includes(type) || !uuid.safeParse(listingId).success) return;
  try {
    const ip = clientIp(await headers());
    if (!rateLimit(`contact:${ip}:${listingId}`, 5, 3600_000).ok) return;
    const l = await db.query.listings.findFirst({ where: eq(listings.id, listingId), columns: { dealerId: true } });
    if (!l) return;
    await db.insert(contactClicks).values({ listingId, dealerId: l.dealerId, type });
  } catch {
    // statistika ne smije da sruši stranicu
  }
}

/** Brojač pregleda: jednom po IP-u i oglasu na sat. Ukupan broj na oglasu + dnevni red za statistiku (jedan upit). */
export async function trackView(listingId: string) {
  if (!uuid.safeParse(listingId).success) return;
  try {
    const ip = clientIp(await headers());
    if (!rateLimit(`view:${ip}:${listingId}`, 1, 3600_000).ok) return;
    await db.execute(sql`
      WITH l AS (
        UPDATE listings SET views_count = views_count + 1 WHERE id = ${listingId} RETURNING id, dealer_id
      )
      INSERT INTO listing_views_daily (listing_id, dealer_id, day, views)
      SELECT id, dealer_id, ${LOCAL_DAY_SQL}, 1 FROM l
      ON CONFLICT (listing_id, day) DO UPDATE SET views = listing_views_daily.views + 1`);
  } catch {
    // isto
  }
}
