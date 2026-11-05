"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import type { Product } from "@/lib/data";
import { weekKey, type Week } from "@/lib/weeks";
import { ProductRow } from "./ProductRow";
import { SponsorRow } from "./SponsorRow";

export function Leaderboard({
  weeks,
  board,
}: {
  weeks: Week[];
  // Approved launches for each week, keyed "year-week", already ranked
  board: Record<string, Product[]>;
}) {
  const currentIndex = weeks.findIndex((w) => w.current);
  const [index, setIndex] = useState(currentIndex);
  const scroller = useRef<HTMLDivElement>(null);

  const selected = weeks[index];
  const week = selected.number;
  const isFuture = index > currentIndex;
  const products = board[weekKey(selected)] ?? [];
  // A boosted launch takes the sponsor spot for its week
  const boosted = products.find((p) => p.boosted);

  // Keep the selected week visible in the scrollable tab strip
  useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>("[data-active=true]");
    if (el && box)
      box.scrollTo({
        left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2,
        behavior: "smooth",
      });
  }, [index]);

  const scrollBy = (dx: number) =>
    scroller.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section
      aria-label={`Week ${week} launches`}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_3px_rgb(15_23_42/0.04)]"
    >
      {/* Week selector */}
      <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/60 p-2">
        <button
          type="button"
          onClick={() => scrollBy(-200)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-900"
          aria-label="Previous weeks"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div
          ref={scroller}
          className="no-scrollbar relative flex flex-1 gap-1 overflow-x-auto py-1 pr-1"
        >
          {weeks.map((w, i) => {
            const active = i === index;
            const future = i > currentIndex;
            return (
              <button
                key={weekKey(w)}
                type="button"
                onClick={() => setIndex(i)}
                data-active={active}
                title={`${w.label}, ${w.year}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg border-[1.5px] border-transparent px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "badge-pop bg-brand-500 font-semibold text-white"
                    : future
                      ? "text-slate-300 hover:text-slate-500"
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {w.current && (
                  <span
                    className={`size-1.5 rounded-full ${active ? "bg-white" : "bg-emerald-500"}`}
                  />
                )}
                W{w.number}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => scrollBy(200)}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-900"
          aria-label="Next weeks"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {isFuture ? (
        <div className="flex flex-col items-center px-6 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CalendarClock className="size-6" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">
            Week {week} opens soon
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Book a slot for {selected.label} and start the week at the top of
            the board.
          </p>
          <a
            href="/submit"
            className="btn-pop mt-5 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Book a launch slot
          </a>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-20 text-center">
          <h3 className="font-semibold text-slate-900">
            No launches in Week {week}
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {index === currentIndex
              ? "Be the first to launch this week."
              : "Nothing launched this week."}
          </p>
          {index === currentIndex && (
            <a
              href="/submit"
              className="btn-pop mt-5 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Launch your product
            </a>
          )}
        </div>
      ) : (
        <>
          {products.some((p) => p.premium || p.verified) && (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 px-4 py-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-300 px-1 py-px text-[9px] font-bold uppercase text-slate-900">
                  <Crown className="size-2.5" />
                  Premium
                </span>
                Paid launch, pinned to the top
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="size-3.5 fill-sky-500 text-white" />
                Verified maker
              </span>
              <a
                href="/pricing"
                className="font-medium text-brand-700 hover:underline"
              >
                Get Premium
              </a>
            </p>
          )}
          <ol className="divide-y divide-slate-100">
            {products.map((p, i) => (
              <Fragment key={p.slug}>
                <ProductRow product={p} rank={i + 1} />
                {(i === 2 || (i === products.length - 1 && i < 2)) && (
                  <SponsorRow product={boosted} />
                )}
              </Fragment>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
