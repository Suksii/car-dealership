import { Eye, MessageCircle, Phone } from "lucide-react";
import type { DealerStats } from "@/features/dealer-panel/api/getDealerStats";
import { CONTACT_TYPE } from "@/features/listings/lib/labels";
import { formatDate, pluralSr } from "@/lib/utils/format";

interface DealerStatsPanelProps {
  stats: DealerStats;
}

const DAY_FORMAT = { day: "numeric", month: "numeric", timeZone: "UTC" } as const;

/** Pregledi i kontakti placa za 30 dana: brojke + stubići pregleda po danu. */
export default function DealerStatsPanel({ stats }: DealerStatsPanelProps) {
  const peak = Math.max(0, ...stats.series.map((d) => d.views));
  const max = Math.max(1, peak);
  const messages = stats.contacts.filter((c) => c.type !== "phone").reduce((a, c) => a + c.total, 0);
  const calls = stats.contacts.find((c) => c.type === "phone")?.total ?? 0;
  const first = stats.series[0];

  const tiles = [
    { icon: Eye, value: stats.views, label: "pregleda oglasa", sub: `${stats.views7} u zadnjih 7 dana` },
    {
      icon: MessageCircle,
      value: stats.contactsTotal,
      label: pluralSr(stats.contactsTotal, ["kontakt", "kontakta", "kontakata"]),
      sub: `${stats.contacts7} u zadnjih 7 dana`,
    },
    { icon: Phone, value: calls, label: pluralSr(calls, ["poziv", "poziva", "poziva"]), sub: "klik na broj telefona" },
    {
      icon: MessageCircle,
      value: messages,
      label: pluralSr(messages, ["poruka", "poruke", "poruka"]),
      sub: stats.contacts
        .filter((c) => c.type !== "phone" && (c.type !== "email" || c.total > 0))
        .map((c) => `${CONTACT_TYPE[c.type]} ${c.total}`)
        .join(" · "),
    },
  ];

  return (
    <section aria-labelledby="stats-title" className="mb-8">
      <h2 id="stats-title" className="eyebrow text-muted mb-3">
        Zadnjih 30 dana
      </h2>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ icon: Icon, value, label, sub }) => (
          <div key={label + sub} className="card flex flex-col gap-1 p-4">
            <dd className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <Icon size={18} className="text-accent" aria-hidden="true" />
              <span>{value}</span>
            </dd>
            <dt className="text-sm font-medium">{label}</dt>
            <dd className="text-muted text-xs">{sub}</dd>
          </div>
        ))}
      </dl>

      <div className="card mt-3 p-4">
        <p className="mb-3 text-sm font-semibold">Pregledi po danu</p>
        <div
          role="img"
          aria-label={`Pregledi po danu: ukupno ${stats.views} za 30 dana, najviše ${peak} u jednom danu`}
          className="flex h-24 items-end gap-0.5"
        >
          {stats.series.map((d) => (
            <div
              key={d.day}
              title={`${formatDate(d.day, DAY_FORMAT)}: ${d.views} ${pluralSr(d.views, ["pregled", "pregleda", "pregleda"])}`}
              className={
                d.views
                  ? "bg-accent hover:bg-accent-hover min-h-1 flex-1 rounded-t-sm"
                  : "h-1 flex-1 rounded-t-sm bg-neutral-100"
              }
              style={d.views ? { height: `${(d.views / max) * 100}%` } : undefined}
            />
          ))}
        </div>
        <div className="text-muted mt-1 flex justify-between text-xs">
          <span>{formatDate(first.day, DAY_FORMAT)}</span>
          <span>danas</span>
        </div>
        {stats.views === 0 && (
          <p className="text-muted mt-2 text-xs">
            Pregledi se broje od danas. Brojke rastu kako kupci otvaraju oglase.
          </p>
        )}
      </div>
    </section>
  );
}
