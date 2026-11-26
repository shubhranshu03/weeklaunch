import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { categoryHref } from "@/lib/categories";
import { platformHref, platformPages } from "@/lib/platformPages";
import { productCategories } from "@/lib/data";
import { getAllProducts, getMakerHandles } from "@/lib/products";
import { CONTENT_UPDATED, SITE_URL } from "@/lib/site";
import { tools } from "@/lib/tools";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, makers] = await Promise.all([
    getAllProducts(),
    getMakerHandles(),
  ]);
  // Sample (demo) launches aren't real products, so search engines skip them
  const allProducts = products.filter((p) => !p.sample);
  const pages: {
    path: string;
    priority: number;
    changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  }[] = [
    { path: "", priority: 1, changeFrequency: "daily" },
    { path: "/products", priority: 0.9, changeFrequency: "daily" },
    { path: "/hall-of-fame", priority: 0.8, changeFrequency: "daily" },
    { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
    { path: "/platforms", priority: 0.7, changeFrequency: "weekly" },
    ...platformPages.map((p) => ({
      path: platformHref(p),
      priority: 0.7,
      changeFrequency: "daily" as const,
    })),
    { path: "/deals", priority: 0.8, changeFrequency: "daily" },
    { path: "/alternatives", priority: 0.7, changeFrequency: "weekly" },
    ...allProducts.map((p) => ({
      path: `/alternatives/${p.slug}`,
      priority: 0.6,
      changeFrequency: "weekly" as const,
    })),
    { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
    ...posts.map((p) => ({
      path: `/blog/${p.slug}`,
      priority: 0.6,
      changeFrequency: "monthly" as const,
    })),
    ...productCategories.map((c) => ({
      path: categoryHref(c.name),
      priority: 0.8,
      changeFrequency: "daily" as const,
    })),
    { path: "/products/mac", priority: 0.8, changeFrequency: "daily" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    {
      path: "/directory-submission",
      priority: 0.8,
      changeFrequency: "monthly",
    },
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
    ...makers.map((handle) => ({
      url: `${SITE_URL}/makers/${handle}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
