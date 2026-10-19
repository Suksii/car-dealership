import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getPriceStat } from "@/features/listings/api/getPriceStats";
import { formatPrice, pluralSr } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface Props {
  makeId: number;
  modelId: number;
  year: number;
  priceEur: number;
  modelName: string;
}

/** „Cijena je 8% ispod prosjeka“ – samo kad ima dovoljno uporedivih oglasa; inače ne renderuje ništa. */
export default async function PriceEstimate({ makeId, modelId, year, priceEur, modelName }: Props) {
  const stat = await getPriceStat(makeId, modelId, year);
  if (!stat || stat.median <= 0) return null;
  const diff = Math.round(((priceEur - stat.median) / stat.median) * 100);
  const tone = diff <= -5 ? "below" : diff >= 5 ? "above" : "avg";
  const Icon = tone === "below" ? TrendingDown : tone === "above" ? TrendingUp : Minus;
  const text =
    tone === "avg"
      ? "Cijena je oko prosjeka"
      : `Cijena je ${Math.abs(diff)}% ${tone === "below" ? "ispod" : "iznad"} prosjeka`;
  return (
    <div
      className={cn(
        "mt-4 rounded-xl px-3.5 py-3 text-sm",
        tone === "below" && "bg-success/10 text-success",
        tone === "above" && "bg-warning/15 text-amber-700",
        tone === "avg" && "bg-neutral-100 text-neutral-700",
      )}
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icon size={16} aria-hidden="true" />
        <span>{text}</span>
      </p>
      <p className="mt-1 text-xs opacity-80">
        {`${modelName} ${stat.approx ? `${year - 1}–${year + 1}` : year}: prosjek ${formatPrice(Math.round(stat.median))}, raspon ${formatPrice(Math.round(stat.p25))}–${formatPrice(Math.round(stat.p75))} (${stat.sampleSize} ${pluralSr(stat.sampleSize, ["oglas", "oglasa", "oglasa"])})`}
      </p>
    </div>
  );
}
