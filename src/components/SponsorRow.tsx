import Link from "next/link";
import { ArrowUpRight, Zap } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductLogo } from "./ProductRow";

// The sponsor card after the top 3: a boosted launch, or the house ad
export function SponsorRow({ product }: { product?: Product }) {
  if (product)
    return (
      <li className="p-3 sm:p-4">
        <Link
          href={`/products/${product.slug}`}
          className="group relative flex items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-brand-700 to-fuchsia-600 p-6 text-white sm:p-7"
        >
          <div className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative min-w-0 flex-1">
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
              Sponsored
            </span>
            <p className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
              {product.tagline}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white">
              {product.name} <ArrowUpRight className="size-4" />
            </span>
          </div>
          <div className="relative hidden sm:block">
            <ProductLogo logo={product.logo} name={product.name} size="lg" />
          </div>
        </Link>
      </li>
    );

  return (
    <li className="p-3 sm:p-4">
      <Link
        href="/pricing#ads"
        className="group relative flex items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-brand-700 to-fuchsia-600 p-6 text-white sm:p-7"
      >
        <div className="pointer-events-none absolute -bottom-16 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative min-w-0 flex-1">
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 ring-1 ring-white/20">
            Partner
          </span>
          <p className="mt-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
            Get cited by ChatGPT and Google — SEO that writes itself.
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/80 group-hover:text-white">
            RankRocket <ArrowUpRight className="size-4" />
          </span>
        </div>
        <div className="badge-pop relative hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-900 sm:flex">
          <Zap className="size-7 fill-current" />
        </div>
      </Link>
    </li>
  );
}
