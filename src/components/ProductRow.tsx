"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  MessageSquare,
  Star,
  Triangle,
} from "lucide-react";
import { launchInfo, type Product } from "@/lib/data";

const podium = [
  {
    row: "bg-gradient-to-r from-brand-50 via-brand-50/40 to-white",
    chip: "bg-brand-500 text-white",
    label: "1st",
  },
  {
    row: "bg-gradient-to-r from-sky-50/80 via-sky-50/30 to-white",
    chip: "bg-sky-500 text-white",
    label: "2nd",
  },
  {
    row: "bg-gradient-to-r from-pink-50/80 via-pink-50/30 to-white",
    chip: "bg-pink-500 text-white",
    label: "3rd",
  },
];

export function ProductLogo({
  logo,
  name,
  size = "md",
}: {
  logo: Product["logo"];
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center font-bold ring-1 ring-inset ring-white/20 ${
        size === "sm"
          ? "size-10 rounded-full text-sm"
          : size === "lg"
            ? "badge-pop size-20 rounded-full text-3xl"
            : "size-10 rounded-full text-base sm:size-[52px] sm:text-lg"
      }`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${logo.from}, ${logo.to})`,
        color: logo.fg ?? "#fff",
      }}
      aria-label={`${name} logo`}
    >
      {logo.glyph}
    </div>
  );
}

export function UpvoteButton({ count }: { count: number }) {
  const [voted, setVoted] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setVoted((v) => !v)}
      aria-pressed={voted}
      aria-label={voted ? "Remove upvote" : "Upvote"}
      className={`btn-pop flex h-12 w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-bold tabular-nums sm:h-14 sm:w-12 sm:gap-1 ${
        voted
          ? "bg-brand-500 text-white"
          : "bg-white text-slate-900 hover:bg-brand-50"
      }`}
    >
      <Triangle
        key={String(voted)}
        className={`size-3 ${voted ? "animate-pop fill-white" : "fill-current"}`}
      />
      {count + (voted ? 1 : 0)}
    </button>
  );
}

export function ProductRow({
  product,
  rank,
}: {
  product: Product;
  rank: number;
}) {
  const top = rank <= 3 ? podium[rank - 1] : null;

  return (
    <li className={`group ${top?.row ?? "bg-white"}`}>
      <div className="flex items-center gap-2.5 px-3 py-4 transition hover:bg-slate-50/70 sm:gap-4 sm:px-4 sm:py-5">
        <div className="flex w-8 shrink-0 justify-center sm:w-9">
          {top ? (
            <span
              className={`badge-pop rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${top.chip}`}
            >
              {top.label}
            </span>
          ) : (
            <span className="text-sm font-semibold tabular-nums text-slate-300">
              {String(rank).padStart(2, "0")}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4"
        >
          <ProductLogo logo={product.logo} name={product.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[15px] font-semibold text-slate-900 group-hover:text-brand-700">
                {product.name}
              </h3>
              {product.verified && (
                <BadgeCheck
                  className="size-4 shrink-0 fill-brand-500 text-white"
                  aria-label="Verified"
                />
              )}
              {product.premium && (
                <span className="badge-pop hidden rounded-md bg-amber-300 px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-slate-900 sm:inline">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-slate-500 sm:line-clamp-1">
              {product.tagline}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              {product.rating ? (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {product.rating.score.toFixed(1)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400">
                  <Star className="size-3" />
                  New
                </span>
              )}
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {product.comments}
              </span>
              {product.tags.slice(0, 2).map((t) => (
                <span
                  key={t}
                  className="hidden rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600 sm:inline"
                >
                  #{t.toLowerCase().replace(/\s+/g, "")}
                </span>
              ))}
            </div>
          </div>
        </Link>

        {top && (
          <a
            href={launchInfo(product).website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pop hidden h-9 shrink-0 items-center gap-1 rounded-lg bg-amber-300 px-3 text-sm font-bold text-slate-900 hover:bg-amber-200 sm:flex"
          >
            Visit <ArrowUpRight className="size-4" />
          </a>
        )}
        <UpvoteButton count={product.upvotes} />
      </div>
    </li>
  );
}
