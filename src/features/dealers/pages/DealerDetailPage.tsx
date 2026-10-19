import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Globe, Mail, MapPin, Phone, Store } from "lucide-react";
import { getDealerBySlug } from "@/features/dealers/api/getDealers";
import { getListings } from "@/features/listings/api/getListings";
import { parseFilters, filtersToQuery } from "@/features/listings/lib/filters";
import { DAYS, hasHours } from "@/features/dealers/lib/hours";
import DealerMap from "@/features/dealers/components/DealerMap";
import ListingCard from "@/features/listings/components/ListingCard";
import Pagination from "@/features/shared/components/ui/Pagination";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import SortSelect from "@/features/listings/components/SortSelect";
import { cn } from "@/lib/utils/cn";
import { pluralSr } from "@/lib/utils/format";

type SP = Record<string, string | string[] | undefined>;

export default async function DealerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const dealer = await getDealerBySlug(slug);
  if (!dealer) notFound();
  const filters = { ...parseFilters(sp), dealer: slug };
  const result = await getListings(filters);
  const hrefTemplate =
    `/placevi/${slug}?${filtersToQuery({ ...filters, dealer: undefined, page: undefined })}&page={page}`.replace(
      "?&",
      "?",
    );

  const contacts = [
    dealer.address && { icon: MapPin, text: `${dealer.address}, ${dealer.city.name}` },
    { icon: Phone, text: dealer.phone, href: `tel:${dealer.phone.replace(/[^\d+]/g, "")}` },
    dealer.phone2 && { icon: Phone, text: dealer.phone2, href: `tel:${dealer.phone2.replace(/[^\d+]/g, "")}` },
    dealer.email && { icon: Mail, text: dealer.email, href: `mailto:${dealer.email}` },
    dealer.website && { icon: Globe, text: dealer.website.replace(/^https?:\/\//, ""), href: dealer.website },
  ].filter(Boolean) as { icon: typeof MapPin; text: string; href?: string }[];
  const hours = hasHours(dealer.workingHours) ? dealer.workingHours : null;
  const hasMap = !!dealer.lat && !!dealer.lng;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Autoplacevi", href: "/placevi" }, { label: dealer.name }]} />

      <section className="card mt-4 overflow-hidden">
        {dealer.cover && (
          <div className="relative aspect-[3/1] bg-neutral-200 md:aspect-[4/1]">
            <Image
              src={dealer.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-end md:justify-between md:p-6">
          <div className="flex items-end gap-4">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100",
                dealer.cover && "ring-surface -mt-14 ring-4",
              )}
            >
              {dealer.logo ? (
                <Image src={dealer.logo} alt="" width={80} height={80} className="h-full w-full object-cover" />
              ) : (
                <Store size={30} className="text-neutral-400" aria-hidden="true" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{dealer.name}</h1>
              <p className="text-muted mt-1 text-sm">{`${dealer.city.name} · ${result.total} ${pluralSr(result.total, ["vozilo u ponudi", "vozila u ponudi", "vozila u ponudi"])}`}</p>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            {contacts.map(({ icon: Icon, text, href }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={15} className="text-neutral-400" aria-hidden="true" />
                {href ? (
                  <a href={href} className="hover:text-accent">
                    {text}
                  </a>
                ) : (
                  <span>{text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {(dealer.description || hours || hasMap) && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {dealer.description && (
            <section
              className={cn(
                "card p-5",
                !hours && !hasMap && "md:col-span-3",
                (hours && !hasMap) || (!hours && hasMap) ? "md:col-span-2" : "",
              )}
            >
              <h2 className="mb-2 text-base font-bold tracking-tight">O placu</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-700">{dealer.description}</p>
            </section>
          )}
          {hours && (
            <section className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight">
                <Clock size={16} aria-hidden="true" /> Radno vrijeme
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                {DAYS.map(([key, label]) => (
                  <div key={key} className="contents">
                    <dt className="text-muted">{label}</dt>
                    <dd className={cn("font-medium", !hours[key] && "text-muted")}>{hours[key] ?? "Zatvoreno"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {hasMap && <DealerMap lat={dealer.lat!} lng={dealer.lng!} name={dealer.name} />}
        </div>
      )}

      <div className="mt-10 mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Ponuda</h2>
        <SortSelect filters={filters} />
      </div>
      {result.items.length === 0 ? (
        <p className="text-muted">Ovaj plac trenutno nema aktivnih oglasa.</p>
      ) : (
        <div className="grid-listings">
          {result.items.map((item, i) => (
            <ListingCard key={item.id} item={item} priority={i < 4} />
          ))}
        </div>
      )}
      <Pagination currentPage={result.page} lastPage={result.lastPage} hrefTemplate={hrefTemplate} className="mt-10" />
    </div>
  );
}
