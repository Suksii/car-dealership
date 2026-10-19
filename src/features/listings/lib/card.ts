import { imageUrl } from "@/lib/images";
import { formatRelativeDay } from "@/lib/utils/format";
import { listingPath, listingTitle } from "./listing";
import type { FuelKey, TransmissionKey, BodyKey } from "./labels";

/** Minimalni serializable oblik oglasa za karticu (ide i u klijentske komponente). */
export interface ListingCardItem {
  id: string;
  href: string;
  /** "Marka Model varijanta" – za alt i naslov stranice. */
  title: string;
  /** "Marka Model" */
  name: string;
  variant: string | null;
  year: number;
  mileageKm: number;
  fuel: FuelKey;
  transmission: TransmissionKey;
  bodyType: BodyKey;
  powerKw: number | null;
  priceEur: number;
  priceOnRequest: boolean;
  priceNegotiable: boolean;
  image: string | null;
  imageAlt: string;
  city: string;
  dealer: { name: string; slug: string } | null;
  isNew: boolean;
  /** "danas", "juče", "prije 5 dana"… (na nivou dana, računato pri keširanju liste). */
  publishedAgo: string | null;
  customsCleared: boolean;
}

type Row = {
  id: string;
  slug: string;
  publicId: string;
  year: number;
  mileageKm: number;
  fuel: FuelKey;
  transmission: TransmissionKey;
  bodyType: BodyKey;
  powerKw: number | null;
  priceEur: number;
  priceOnRequest: boolean;
  priceNegotiable: boolean;
  variant: string | null;
  customsCleared: boolean;
  publishedAt: Date | null;
  make: { name: string };
  model: { name: string };
  city: { name: string };
  dealer: { name: string; slug: string } | null;
  images: { storageKey: string }[];
};

const NEW_DAYS = 3;

export function toCardItem(row: Row, now: number): ListingCardItem {
  const title = listingTitle(row.make.name, row.model.name, row.variant);
  return {
    id: row.id,
    href: listingPath(row.slug, row.publicId),
    title,
    name: `${row.make.name} ${row.model.name}`,
    variant: row.variant,
    year: row.year,
    mileageKm: row.mileageKm,
    fuel: row.fuel,
    transmission: row.transmission,
    bodyType: row.bodyType,
    powerKw: row.powerKw,
    priceEur: row.priceEur,
    priceOnRequest: row.priceOnRequest,
    priceNegotiable: row.priceNegotiable,
    image: row.images[0] ? imageUrl(row.images[0].storageKey, "card") : null,
    imageAlt: `${title} ${row.year}`,
    city: row.city.name,
    dealer: row.dealer ? { name: row.dealer.name, slug: row.dealer.slug } : null,
    isNew: !!row.publishedAt && now - row.publishedAt.getTime() < NEW_DAYS * 86400_000,
    publishedAgo: formatRelativeDay(row.publishedAt, now),
    customsCleared: row.customsCleared,
  };
}
