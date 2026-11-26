import { productCategories, type Product } from "./data";

// Category pages live at /categories/<slug>, like /categories/social-media
export const categorySlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const categoryHref = (name: string) => `/categories/${categorySlug(name)}`;

export const categoryBySlug = (slug: string) =>
  productCategories.find((c) => categorySlug(c.name) === slug) ?? null;

// Words used in titles and sentences ("AI products", "developer tools")
const nouns: Record<string, string> = {
  AI: "AI tools",
  Productivity: "productivity tools",
  DevTool: "developer tools",
  Design: "design tools",
  Marketing: "marketing tools",
  Analytics: "analytics tools",
  Finance: "finance tools",
  "Social Media": "social media tools",
};
export const categoryNoun = (name: string) =>
  nouns[name] ?? `${name.toLowerCase()} products`;

// Launches listed in a category (any of their tags, not only the first)
export const inCategory = (products: Product[], name: string) =>
  products.filter((p) => p.tags.includes(name));
