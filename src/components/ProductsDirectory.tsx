"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Code,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Palette,
  Search,
  SearchX,
  Sparkles,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { allProducts, productCategories } from "@/lib/data";
import { ProductRow } from "./ProductRow";

const icons: Record<string, { icon: LucideIcon; tint: string }> = {
  AI: { icon: Sparkles, tint: "bg-violet-100 text-violet-700" },
  Productivity: { icon: Zap, tint: "bg-amber-100 text-amber-700" },
  DevTool: { icon: Code, tint: "bg-slate-200 text-slate-800" },
  Design: { icon: Palette, tint: "bg-pink-100 text-pink-700" },
  Marketing: { icon: Megaphone, tint: "bg-orange-100 text-orange-700" },
  Analytics: { icon: BarChart3, tint: "bg-sky-100 text-sky-700" },
  Finance: { icon: Wallet, tint: "bg-emerald-100 text-emerald-700" },
  "Social Media": {
    icon: MessageCircle,
    tint: "bg-indigo-100 text-indigo-700",
  },
};

// Every product is listed once, under its main (first) category

export function ProductsDirectory() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productCategories
      .filter((c) => category === "All" || c.name === category)
      .map((c) => ({
        ...c,
        items: allProducts
          .filter((p) => p.tags[0] === c.name)
          .filter(
            (p) =>
              !q ||
              p.name.toLowerCase().includes(q) ||
              p.tagline.toLowerCase().includes(q),
          )
          .sort((a, b) => b.upvotes - a.upvotes),
      }))
      .filter((g) => g.items.length > 0);
  }, [category, query]);

  const countFor = (name: string) =>
    allProducts.filter((p) => p.tags[0] === name).length;

  return (
    <div>
      {/* Page header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              All products
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {allProducts.length} products across {productCategories.length}{" "}
              categories
            </p>
          </div>
          <label className="relative block sm:w-64">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-xl border-[1.5px] border-slate-900 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>
        </div>

        {/* Category filter */}
        <div className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:px-6">
          {[{ name: "All" }, ...productCategories].map((c) => {
            const active = category === c.name;
            const Icon = c.name === "All" ? LayoutGrid : icons[c.name].icon;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "badge-pop bg-brand-500 text-white"
                    : "border-[1.5px] border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <Icon className="size-3.5" />
                {c.name}
                <span
                  className={`text-xs ${active ? "text-white/70" : "text-slate-400"}`}
                >
                  {c.name === "All" ? allProducts.length : countFor(c.name)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category sections */}
      {groups.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center">
          <SearchX className="size-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-900">No products found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different word or category.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((g) => {
            const { icon: Icon, tint } = icons[g.name];
            return (
              <section
                key={g.name}
                id={g.name.toLowerCase().replace(/\s+/g, "-")}
                aria-labelledby={`cat-${g.name}`}
                className="scroll-mt-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`badge-pop flex size-10 items-center justify-center rounded-xl ${tint}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2
                      id={`cat-${g.name}`}
                      className="font-semibold text-slate-900"
                    >
                      {g.name}
                    </h2>
                    <p className="text-sm text-slate-500">{g.blurb}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {g.items.length}{" "}
                    {g.items.length === 1 ? "product" : "products"}
                  </span>
                </div>
                <ol className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgb(15_23_42/0.04)]">
                  {g.items.map((p, i) => (
                    <ProductRow key={p.slug} product={p} rank={i + 1} />
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
