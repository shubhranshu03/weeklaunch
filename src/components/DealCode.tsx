"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// A coupon code with a one-click copy, for deal lists
export function DealCode({
  code,
  size = "md",
}: {
  code: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Copying can be blocked; the code is still on screen
        }
      }}
      aria-label={`Copy coupon code ${code}`}
      className={`relative z-10 flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 font-mono font-bold tracking-wide text-slate-900 hover:border-emerald-400 hover:bg-emerald-50 ${
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
      }`}
    >
      <span className="truncate">{code}</span>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="size-3.5 shrink-0 text-slate-400" />
      )}
    </button>
  );
}
