import Image from "next/image";
import { notFound } from "next/navigation";
import { Globe, Mail, MapPin, Phone, Store } from "lucide-react";
import { getDealerBySlug } from "@/features/dealers/api/getDealers";
import { getListings } from "@/features/listings/api/getListings";
import { parseFilters, filtersToQuery } from "@/features/listings/lib/filters";
import ListingCard from "@/features/listings/components/ListingCard";
import Pagination from "@/features/shared/components/ui/Pagination";
import Breadcrumbs from "@/features/shared/components/ui/Breadcrumbs";
import SortSelect from "@/features/listings/components/SortSelect";
import { pluralSr } from "@/lib/utils/format";

type SP = Record<string, string | string[] | undefined>;

export default async function DealerDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const dealer = await getDealerBySlug(slug);
  if (!dealer) notFound();
  const filters = { ...parseFilters(sp), dealer: slug };
  const result = await getListings(filters);
  const hrefTemplate = `/placevi/${slug}?${filtersToQuery({ ...filters, dealer: undefined, page: undefined })}&page={page}`.replace("?&", "?");

  const contacts = [
    dealer.address && { icon: MapPin, text: `${dealer.address}, ${dealer.city.name}` },
    { icon: Phone, text: dealer.phone, href: `tel:${dealer.phone.replace(/[^\d+]/g, "")}` },
    dealer.email && { icon: Mail, text: dealer.email, href: `mailto:${dealer.email}` },
    dealer.website && { icon: Globe, text: dealer.website.replace(/^https?:\/\//, ""), href: dealer.website },
  ].filter(Boolean) as { icon: typeof MapPin; text: string; href?: string }[];

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Autoplacevi", href: "/placevi" }, { label: dealer.name }]} />

      <section className="card mt-4 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
            {dealer.logo ? <Image src={dealer.logo} alt="" width={80} height={80} className="h-full w-full object-cover" /> : <Store size={30} className="text-neutral-400" aria-hidden="true" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{dealer.name}</h1>
            <p className="mt-1 text-sm text-muted">{result.total} {pluralSr(result.total, ["vozilo u ponudi", "vozila u ponudi", "vozila u ponudi"])}</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5 text-sm">
          {contacts.map(({ icon: Icon, text, href }) => (
            <li key={text} className="flex items-center gap-2"><Icon size={15} className="text-neutral-400" aria-hidden="true" />{href ? <a href={href} className="hover:text-accent">{text}</a> : <span>{text}</span>}</li>
          ))}
        </ul>
      </section>
      {dealer.description && <p className="mt-4 max-w-3xl text-sm text-neutral-700">{dealer.description}</p>}

      <div className="mt-10 mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Ponuda</h2>
        <SortSelect filters={filters} />
      </div>
      {result.items.length === 0 ? (
        <p className="text-muted">Ovaj plac trenutno nema aktivnih oglasa.</p>
      ) : (
        <div className="grid-listings">{result.items.map((item, i) => <ListingCard key={item.id} item={item} priority={i < 4} />)}</div>
      )}
      <Pagination currentPage={result.page} lastPage={result.lastPage} hrefTemplate={hrefTemplate} className="mt-10" />
    </div>
  );
}
