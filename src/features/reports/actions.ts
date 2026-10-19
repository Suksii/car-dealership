"use server";

import { z } from "zod";
import { and, eq, gte, count } from "drizzle-orm";
import { connection } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { listings, reports } from "@/db/schema";
import { REPORT_REASON } from "@/features/reports/lib/labels";

export type ReportState = { errors?: Record<string, string>; message?: string; done?: boolean } | undefined;

const schema = z.object({
  reason: z.enum(Object.keys(REPORT_REASON) as [keyof typeof REPORT_REASON, ...(keyof typeof REPORT_REASON)[]], {
    message: "Izaberi razlog",
  }),
  message: z.string().trim().max(500, "Najviše 500 znakova").optional(),
});

/** Prijava oglasa; prijava ne traži nalog. Ograničenje: najviše 20 otvorenih prijava po oglasu u zadnjih 24h. */
export async function reportListing(listingId: string, _prev: ReportState, fd: FormData): Promise<ReportState> {
  await connection();
  const parsedId = z.uuid().safeParse(listingId);
  if (!parsedId.success) return { message: "Oglas nije pronađen." };
  const parsed = schema.safeParse({ reason: fd.get("reason") || undefined, message: fd.get("message") ?? "" });
  if (!parsed.success)
    return { errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };

  const listing = await db.query.listings.findFirst({ where: eq(listings.id, parsedId.data), columns: { id: true } });
  if (!listing) return { message: "Oglas nije pronađen." };

  const since = new Date(Date.now() - 86400_000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(reports)
    .where(and(eq(reports.listingId, listing.id), gte(reports.createdAt, since)));
  if (n >= 20) return { done: true, message: "Hvala, prijava je već zabilježena." };

  const session = await auth();
  await db.insert(reports).values({
    listingId: listing.id,
    reporterUserId: session?.user.id ?? null,
    reason: parsed.data.reason,
    message: parsed.data.message || null,
  });
  return { done: true, message: "Hvala, pogledaćemo oglas." };
}
