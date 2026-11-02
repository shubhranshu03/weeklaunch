import type { MetadataRoute } from "next";
import { allProducts } from "@/lib/data";
import { CONTENT_UPDATED, SITE_URL } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: {
    path: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/products", priority: 0.9, changeFrequency: "daily" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/submit", priority: 0.8, changeFrequency: "monthly" },
    { path: "/tools", priority: 0.8, changeFrequency: "monthly" },
    ...tools
      .filter((t) => t.slug !== "launch-badge")
      .map((t) => ({
        path: `/tools/${t.slug}`,
        priority: 0.8,
        changeFrequency: "monthly" as const,
      })),
    { path: "/badges", priority: 0.5, changeFrequency: "monthly" },
    { path: "/about", priority: 0.5, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  ];

  return [
    ...pages.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...allProducts.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
