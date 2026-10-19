import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { requireSession } from "@/lib/dal";
import { toCardItem } from "@/features/listings/lib/card";
import ListingCard from "@/features/listings/components/ListingCard";
import Button from "@/features/shared/components/ui/Button";

type Row = Parameters<typeof toCardItem>[0] & { status: string; dealer: { status: string } | null };

/** Van komponente zbog Date.now() (pravilo čistoće rendera). */
function toItems(rows: Row[]) {
  const now = Date.now();
  return rows.filter((l) => l.status === "active" && l.dealer?.status === "active").map((l) => toCardItem(l, now));
}

/** Sačuvani oglasi prijavljenog korisnika. Per-user, bez keša. */
export default async function FavoritesPage() {
  const { user } = await requireSession("/nalog/favoriti");
  const rows = await db.query.favorites.findMany({
    where: eq(favorites.userId, user.id),
    orderBy: desc(favorites.createdAt),
    with: {
      listing: {
        with: {
          make: true,
          model: true,
          city: true,
          dealer: { columns: { name: true, slug: true, status: true } },
          images: { limit: 1, orderBy: (i, { asc }) => asc(i.sortOrder) },
        },
      },
    },
  });
  const items = toItems(rows.map((r) => r.listing));

  if (items.length === 0) {
    return (
      <div className="border-border bg-surface rounded-2xl border border-dashed p-12 text-center">
        <p className="text-muted">Još nemaš sačuvanih oglasa. Klikni na srce na oglasu koji ti se sviđa.</p>
        <Button href="/automobili" variant="outline" className="mt-5">
          Pogledaj automobile
        </Button>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <ListingCard key={item.id} item={item} priority={i < 3} />
      ))}
    </div>
  );
}
