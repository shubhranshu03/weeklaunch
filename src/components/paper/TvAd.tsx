import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { SidebarAd } from "@/lib/sidebarAds";

// A sidebar ad spot drawn as an old CRT television: wood cabinet, rabbit-ear
// antennas, a curved glowing screen with scanlines, knobs and a speaker grille.
// With an advertiser it shows their brand; an empty spot sells itself.
export function TvAd({
  channel,
  total,
  ad,
}: {
  channel: number;
  total: number;
  ad?: SidebarAd;
}) {
  const tv = <TvSet channel={channel} total={total} ad={ad} />;
  return (
    <aside aria-label="Advertisement" className="pt-7">
      {ad ? (
        <>
          <a
            href={ad.link}
            target="_blank"
            rel="sponsored noopener"
            className="tv group relative block"
          >
            {tv}
          </a>
          <Link
            href="/pricing#ads"
            className="mt-1.5 block text-center font-sans text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-press"
          >
            Advertise here · $49/month
          </Link>
        </>
      ) : (
        <Link href="/pricing#ads" className="tv group relative block">
          {tv}
        </Link>
      )}
    </aside>
  );
}

function TvSet({
  channel,
  total,
  ad,
}: {
  channel: number;
  total: number;
  ad?: SidebarAd;
}) {
  return (
    <>
      {/* Rabbit ears */}
      <span
        aria-hidden
        className="absolute -top-7 left-1/2 h-8 w-20 -translate-x-1/2"
      >
        <span className="absolute bottom-1 left-1/2 h-8 w-[2px] origin-bottom -translate-x-1/2 -rotate-[32deg] rounded-full bg-ink" />
        <span className="absolute bottom-1 left-1/2 h-9 w-[2px] origin-bottom -translate-x-1/2 rotate-[26deg] rounded-full bg-ink" />
        <span className="absolute bottom-0 left-1/2 h-3 w-8 -translate-x-1/2 rounded-t-full border-2 border-ink bg-[#3a2a1c]" />
      </span>

      {/* Cabinet */}
      <span className="tv-cabinet relative flex gap-2.5 rounded-[18px] border-2 border-ink p-2.5 shadow-[4px_4px_0_0_var(--color-line)] transition group-hover:-translate-y-0.5 group-hover:shadow-[5px_6px_0_0_var(--color-line)]">
        {/* Screen */}
        <span className="relative min-w-0 flex-1 rounded-[10px] border-2 border-ink bg-[#14110d] p-1.5">
          <span className="tv-screen relative block overflow-hidden rounded-[22px/16px] px-3 pb-3 pt-2.5 text-center">
            <span className="flex items-center justify-between font-mono text-[9px] font-bold uppercase tracking-wider text-[#cfe8c9]/80">
              <span>CH {String(channel).padStart(2, "0")}</span>
              <span className="flex items-center gap-1">
                <span className="tv-onair size-1.5 rounded-full bg-[#ff5a4e]" />
                On air
              </span>
            </span>
            {ad ? (
              <>
                <span className="mt-2 block font-sans text-[9px] uppercase tracking-[0.24em] text-[#cfe8c9]/70">
                  Sponsored{ad.sample && " · Sample"}
                </span>
                <span className="mt-1.5 flex items-center justify-center gap-2">
                  {ad.logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- advertiser logo
                    <img
                      src={ad.logoUrl}
                      alt=""
                      className="size-8 shrink-0 rounded-lg"
                    />
                  )}
                  <span className="tv-glow font-display text-xl font-black leading-tight text-[#f4f1e4]">
                    {ad.brand}
                  </span>
                </span>
                <span className="mt-1 block font-serif text-[13px] font-semibold leading-snug text-[#f4f1e4]/90">
                  {ad.tagline}
                </span>
                {ad.details && (
                  <span className="mt-0.5 block font-serif text-[12px] italic leading-snug text-[#d9d4c2]/80">
                    {ad.details}
                  </span>
                )}
                <span
                  className="mt-2.5 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-sans text-[10px] font-black uppercase tracking-wider text-[#1b1813] transition group-hover:brightness-110"
                  style={{ backgroundColor: ad.color }}
                >
                  Visit {ad.brand} <ArrowUpRight className="size-3" />
                </span>
              </>
            ) : (
              <>
                <span className="mt-2 block font-sans text-[9px] uppercase tracking-[0.24em] text-[#cfe8c9]/70">
                  Advertisement
                </span>
                <span className="tv-glow mt-1 block font-display text-lg font-black leading-tight text-[#f4f1e4]">
                  Advertise in The IndieShip
                </span>
                <span className="mt-1 block font-serif text-[13px] italic leading-snug text-[#d9d4c2]/85">
                  Your logo, one line and a link on every page. Spot {channel}{" "}
                  of {total} · $49/month.
                </span>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-sm bg-[#f2c14e] px-2 py-0.5 font-sans text-[10px] font-black uppercase tracking-wider text-[#1b1813] transition group-hover:bg-[#ffd76b]">
                  Book this spot <ArrowRight className="size-3" />
                </span>
              </>
            )}
            {/* Scanlines, glass glare and the edge vignette */}
            <span
              aria-hidden
              className="tv-lines pointer-events-none absolute inset-0"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -left-6 -top-8 h-16 w-40 rotate-[-18deg] rounded-full bg-white/10 blur-md"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[22px/16px] shadow-[inset_0_0_26px_8px_rgba(0,0,0,0.65)]"
            />
          </span>
        </span>

        {/* Controls */}
        <span
          aria-hidden
          className="flex w-9 shrink-0 flex-col items-center gap-2.5 rounded-lg border-2 border-ink bg-[#2a1f15] py-2.5"
        >
          {[0, 1].map((k) => (
            <span
              key={k}
              className="relative size-6 rounded-full border-2 border-ink bg-[#e9dfc6] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25)]"
            >
              <span
                className={`absolute left-1/2 top-0.5 h-2 w-[2px] -translate-x-1/2 rounded-full bg-ink ${
                  k ? "rotate-[40deg]" : "-rotate-[25deg]"
                } origin-[50%_9px] transition-transform duration-500 group-hover:rotate-[120deg]`}
              />
            </span>
          ))}
          <span className="mt-0.5 flex w-5 flex-col gap-[3px]">
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className="h-[2px] rounded-full bg-[#e9dfc6]/50" />
            ))}
          </span>
          <span className="mt-auto size-1.5 rounded-full bg-[#ff5a4e] shadow-[0_0_6px_#ff5a4e]" />
        </span>
      </span>

      {/* Feet */}
      <span aria-hidden className="flex justify-between px-6">
        <span className="h-2.5 w-3 rounded-b-md border-2 border-t-0 border-ink bg-[#3a2a1c]" />
        <span className="h-2.5 w-3 rounded-b-md border-2 border-t-0 border-ink bg-[#3a2a1c]" />
      </span>
    </>
  );
}
