import Image from "next/image";
import Link from "next/link";
import { getBodyTypeStats } from "@/features/listings/api/getListings";
import { BODY } from "@/features/listings/lib/labels";
import { pluralSr } from "@/lib/utils/format";

const SHORT: Partial<Record<keyof typeof BODY, string>> = { suv: "SUV i džipovi" };

/** Red kartica po karoseriji sa slikom pravog oglasa iz baze. Prikazuje samo karoserije koje imaju oglase. */
export default async function BodyTypes() {
  const stats = (await getBodyTypeStats()).filter((s) => s.image).slice(0, 6);
  if (stats.length < 2) return null;
  return (
    <ul className="row-scroll">
      {stats.map((s) => (
        <li key={s.body} className="w-40 shrink-0 snap-start lg:w-auto lg:max-w-64 lg:flex-1">
          <Link
            href={`/automobili?karoserija=${s.body}`}
            className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-neutral-200"
          >
            {s.image && (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 160px, 200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            <div className="img-fade absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-x-3 bottom-3 text-white">
              <p className="text-sm font-bold">{SHORT[s.body] ?? BODY[s.body]}</p>
              <p className="text-xs text-white/75">
                {s.count} {pluralSr(s.count, ["oglas", "oglasa", "oglasa"])}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
