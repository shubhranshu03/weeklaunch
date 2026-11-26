"use client";

import { useState } from "react";
import { Check, Copy, Tag } from "lucide-react";
import type { Deal } from "@/lib/deals";

// The maker's discount on their product page, with a one-click copy of the code
export function DealBox({ deal, name }: { deal: Deal; name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section
      aria-label="Discount"
      className="mt-5 flex flex-col gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-500/5 p-4 sm:flex-row sm:items-center"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
        <Tag className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">
          {deal.percent != null
            ? `${deal.percent}% off ${name}`
            : `A deal on ${name}`}
        </span>
        <span className="block text-sm text-slate-600">
          {deal.text || "For IndieShip visitors"}
        </span>
      </span>
      {deal.code && (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(deal.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // Copying can be blocked; the code is still on screen
            }
          }}
          className="flex h-10 shrink-0 items-center gap-2 self-start rounded-xl border border-emerald-300 bg-white px-3 font-mono text-sm font-bold tracking-wide text-slate-900 hover:bg-emerald-50 sm:self-auto"
          aria-label={`Copy coupon code ${deal.code}`}
        >
          {deal.code}
          {copied ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <Copy className="size-4 text-slate-400" />
          )}
        </button>
      )}
    </section>
  );
}
