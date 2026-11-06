import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The share card reads the Geist font files from disk
  outputFileTracingIncludes: {
    "/share/[slug]": ["./assets/fonts/**"],
  },
  partialPrefetching: true,
  images: {
    // Illustrated placeholder avatars for sample reviews
    remotePatterns: [{ protocol: "https", hostname: "api.dicebear.com" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
