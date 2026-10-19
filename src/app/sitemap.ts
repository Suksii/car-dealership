import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getSitemapEntries } from "@/features/listings/api/getListingSlugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { listings, dealers } = await getSitemapEntries();
  const base = SITE.url;
  return [
    { url: base, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/automobili`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/placevi`, changeFrequency: "daily", priority: 0.7 },
    ...listings.map((l) => ({
      url: `${base}/oglas/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...dealers.map((d) => ({
      url: `${base}/placevi/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
