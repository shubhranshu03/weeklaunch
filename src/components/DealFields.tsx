"use client";

import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import {
  DEAL_CODE_MAX,
  DEAL_TEXT_MAX,
  dealLabel,
  emptyDeal,
  hasDeal,
  type Deal,
} from "@/lib/deals";

const input =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

// Optional discount for IndieShip visitors, closed until the maker adds one
export function DealFields({
  value,
  onChange,
  error,
}: {
  value: Deal;
  onChange: (d: Deal) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(hasDeal(value));
  const set = <K extends keyof Deal>(k: K, v: Deal[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Tag className="size-4 text-emerald-600" />
        Discount code
        <span className="font-normal text-slate-400">(optional)</span>
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        A deal for IndieShip visitors. It shows on your product page and as a
        badge on your launch card.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          <Plus className="size-4" />
          Add discount code
        </button>
      ) : (
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Coupon code
              </span>
              <input
                className={`${input} mt-1 font-mono uppercase`}
                value={value.code}
                onChange={(e) =>
                  set(
                    "code",
                    e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""),
                  )
                }
                maxLength={DEAL_CODE_MAX}
                placeholder="WEEKLAUNCH30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Discount
              </span>
              <span className="relative mt-1 block">
                <input
                  className={`${input} pr-8`}
                  inputMode="numeric"
                  value={value.percent ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 3);
                    set("percent", v ? Number(v) : null);
                  }}
                  placeholder="30"
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  %
                </span>
              </span>
            </label>
          </div>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-700">
                What it covers
              </span>
              <span className="text-xs text-slate-400">
                {value.text.length}/{DEAL_TEXT_MAX}
              </span>
            </span>
            <input
              className={`${input} mt-1`}
              value={value.text}
              onChange={(e) => set("text", e.target.value)}
              maxLength={DEAL_TEXT_MAX}
              placeholder="First 3 months of any plan"
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            {hasDeal(value) ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                <Tag className="size-3.5" />
                {dealLabel(value)}
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                onChange(emptyDeal);
                setOpen(false);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600"
            >
              <X className="size-3.5" />
              Remove discount
            </button>
          </div>
          {error && (
            <p data-error className="text-xs font-medium text-rose-600">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
