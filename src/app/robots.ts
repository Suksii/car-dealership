import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/plac",
          "/nalog",
          "/admin",
          "/api",
          "/prijava",
          "/registracija",
          "/zaboravljena-lozinka",
          "/nova-lozinka",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
