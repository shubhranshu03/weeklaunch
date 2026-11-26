import type { Product } from "./data";

// Browse pages by what a product runs on: /platforms/<slug>
export const platformPages = [
  { id: "web", slug: "web", name: "Web", noun: "web apps" },
  { id: "mac", slug: "mac", name: "Mac", noun: "Mac apps" },
  { id: "ios", slug: "ios", name: "iOS", noun: "iOS apps" },
  { id: "android", slug: "android", name: "Android", noun: "Android apps" },
  {
    id: "chrome",
    slug: "chrome-extensions",
    name: "Chrome extensions",
    noun: "Chrome extensions",
  },
  { id: "windows", slug: "windows", name: "Windows", noun: "Windows apps" },
] as const;

export type PlatformPage = (typeof platformPages)[number];

export const platformHref = (p: PlatformPage) => `/platforms/${p.slug}`;

export const platformBySlug = (slug: string) =>
  platformPages.find((p) => p.slug === slug) ?? null;

export const onPlatform = (products: Product[], id: string) =>
  products.filter((p) => p.app.platform === id);
