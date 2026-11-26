import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Product } from "@/lib/data";
import type { SidebarAd } from "@/lib/sidebarAds";
import { ProductLogo } from "../ProductRow";

export type Tile =
  { kind: "ad"; ad: SidebarAd } | { kind: "product"; product: Product };

const box =
  "group flex flex-col items-center w-full rounded-xl border border-slate-200 bg-white px-3 py-4 text-center transition hover:border-slate-300 hover:shadow-[0_8px_24px_-16px_rgb(15_23_42/0.35)]";

// A sponsor or featured launch in the side columns of wide screens
export function SideTile({ tile }: { tile: Tile }) {
  if (tile.kind === "ad") {
    const { ad } = tile;
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="sponsored noopener"
        className={box}
      >
        {ad.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- advertiser logo from storage
          <img
            src={ad.logoUrl}
            alt=""
            className="size-12 rounded-xl object-cover"
          />
        ) : (
          <span
            className="flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: ad.color }}
          >
            {ad.brand.charAt(0)}
          </span>
        )}
        <span className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
          {ad.brand}
        </span>
        <span className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
          {ad.tagline}
        </span>
        <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {ad.sample ? "Sample ad" : "Sponsored"}
        </span>
      </a>
    );
  }
  const p = tile.product;
  return (
    <Link href={`/products/${p.slug}`} className={box}>
      <ProductLogo logo={p.logo} name={p.name} />
      <span className="mt-3 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
        {p.name}
      </span>
      <span className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">
        {p.tagline}
      </span>
      <span className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {p.sample ? "Sample · Featured" : "Featured"}
      </span>
    </Link>
  );
}

export function AdvertiseTile() {
  return (
    <Link
      href="/pricing#ads"
      className="group flex w-full flex-col items-center rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-5 text-center transition hover:border-brand-300"
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500 text-white">
        <Sparkles className="size-5" />
      </span>
      <span className="mt-3 text-sm font-semibold text-brand-700">
        Advertise here
      </span>
      <span className="mt-1 text-xs text-brand-600/80">
        Promote your product
      </span>
    </Link>
  );
}

// One sponsor as a small pill in the scrolling strip
function Chip({ tile }: { tile: Tile }) {
  const cls =
    "flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300";
  if (tile.kind === "ad")
    return (
      <a
        href={tile.ad.link}
        target="_blank"
        rel="sponsored noopener"
        className={cls}
      >
        {tile.ad.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- advertiser logo from storage
          <img
            src={tile.ad.logoUrl}
            alt=""
            className="size-6 rounded-md object-cover"
          />
        ) : (
          <span
            className="flex size-6 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: tile.ad.color }}
          >
            {tile.ad.brand.charAt(0)}
          </span>
        )}
        {tile.ad.brand}
      </a>
    );
  const p = tile.product;
  return (
    <Link href={`/products/${p.slug}`} className={cls}>
      <span className="[&>*]:!size-6 [&>*]:!rounded-md [&>*]:!text-[10px]">
        <ProductLogo logo={p.logo} name={p.name} size="sm" />
      </span>
      {p.name}
    </Link>
  );
}

// Below 1440px, sponsors scroll in a strip above the top bar and fixed along the bottom
export function SponsorStrip({
  tiles,
  bottom = false,
}: {
  tiles: Tile[];
  bottom?: boolean;
}) {
  if (tiles.length === 0) return null;
  const row = (hidden: boolean) => (
    <div
      className="flex shrink-0 gap-3 pr-3"
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      {tiles.map((t, i) => (
        <Chip key={i} tile={t} />
      ))}
      <Link
        href="/pricing#ads"
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-brand-300 bg-brand-50 px-3.5 py-1.5 text-sm font-medium text-brand-700"
      >
        <Sparkles className="size-4" />
        Advertise
      </Link>
    </div>
  );
  return (
    <div
      aria-label="Sponsors"
      className={`overflow-hidden bg-slate-50/90 py-2 backdrop-blur min-[1440px]:hidden ${
        bottom ? "fixed inset-x-0 bottom-0 z-30 border-t border-slate-200" : ""
      }`}
    >
      <div className={`marquee flex w-max ${bottom ? "marquee-reverse" : ""}`}>
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
