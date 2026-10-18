import type { NextConfig } from "next";

const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: r2Host ? [{ protocol: "https", hostname: r2Host }] : [],
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
