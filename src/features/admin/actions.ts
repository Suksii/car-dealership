"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
import { dealers, listings, reports } from "@/db/schema";
import { requireAdmin } from "@/lib/dal";
import { LISTINGS_TAG } from "@/features/listings/api/getListings";
import { DEALERS_TAG } from "@/features/dealers/api/getDealers";

const uuid = z.uuid();
const dealerStatus = z.enum(["pending", "active", "suspended"]);

function invalidate() {
  updateTag(DEALERS_TAG);
  updateTag(LISTINGS_TAG);
  revalidatePath("/admin", "layout");
}

export async function setDealerStatus(dealerId: string, status: "pending" | "active" | "suspended") {
  await requireAdmin();
  await db
    .update(dealers)
    .set({ status: dealerStatus.parse(status) })
    .where(eq(dealers.id, uuid.parse(dealerId)));
  invalidate();
}

export async function setDealerFeatured(dealerId: string, featured: boolean) {
  await requireAdmin();
  await db
    .update(dealers)
    .set({ isFeatured: featured })
    .where(eq(dealers.id, uuid.parse(dealerId)));
  invalidate();
}

/** Oznaka „Provjeren plac": admin je potvrdio PIB u registru. Bez PIB-a se ne može označiti. */
export async function setDealerVerified(dealerId: string, verified: boolean) {
  await requireAdmin();
  const id = uuid.parse(dealerId);
  const d = await db.query.dealers.findFirst({ where: eq(dealers.id, id), columns: { taxId: true } });
  if (verified && !d?.taxId) return;
  await db
    .update(dealers)
    .set({ verifiedAt: verified ? new Date() : null })
    .where(eq(dealers.id, id));
  invalidate();
}

/** Admin skida oglas sa sajta (status removed); plac ga vidi kao obrisan. */
export async function removeListingByAdmin(listingId: string) {
  await requireAdmin();
  await db
    .update(listings)
    .set({ status: "removed" })
    .where(eq(listings.id, uuid.parse(listingId)));
  invalidate();
}

export async function setReportStatus(reportId: string, status: "resolved" | "dismissed") {
  await requireAdmin();
  await db
    .update(reports)
    .set({ status: z.enum(["resolved", "dismissed"]).parse(status) })
    .where(eq(reports.id, uuid.parse(reportId)));
  revalidatePath("/admin", "layout");
}
