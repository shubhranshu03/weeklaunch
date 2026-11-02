"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { CURRENT_WEEK, products, weeks } from "@/lib/data";
import { ProductRow } from "./ProductRow";
import { SponsorRow } from "./SponsorRow";

export function Leaderboard() {
  const [week, setWeek] = useState(CURRENT_WEEK);
  const scroller = useRef<HTMLDivElement>(null);

  const selected = weeks.find((w) => w.number === week)!;
  const isFuture = week > CURRENT_WEEK;

  // Keep the selected week visible in the scrollable tab strip
  useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>("[data-active=true]");
    if (el && box)
      box.scrollTo({
        left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2,
        behavior: "smooth",
      });
  }, [week]);

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
          {weeks.map((w) => {
            const active = w.number === week;
            const future = w.number > CURRENT_WEEK;
            return (
              <button
                key={w.number}
                type="button"
                onClick={() => setWeek(w.number)}
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
      ) : (
        <ol className="divide-y divide-slate-100">
          {products.map((p, i) => (
            <Fragment key={p.slug}>
              <ProductRow product={p} rank={i + 1} />
              {i === 2 && <SponsorRow />}
            </Fragment>
          ))}
        </ol>
      )}
    </section>
  );
}
