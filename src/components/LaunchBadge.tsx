"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { BadgeTheme } from "@/lib/badge";

const themes: Record<BadgeTheme, { box: string; sub: string }> = {
  light: { box: "bg-white text-slate-900", sub: "text-slate-500" },
  dark: { box: "bg-slate-900 text-white", sub: "text-slate-400" },
  brand: {
    box: "bg-gradient-to-br from-brand-500 to-indigo-600 text-white",
    sub: "text-white/70",
  },
};

// Visual badge makers put on their site
export function BadgePreview({
  theme = "light",
  label = "Launched on",
  week,
}: {
  theme?: BadgeTheme;
  label?: string;
  week?: number;
}) {
  const t = themes[theme];
  return (
    <span
      className={`badge-pop inline-flex items-center gap-2.5 rounded-xl py-2 pl-2.5 pr-4 ${t.box}`}
    >
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect
          width="32"
          height="32"
          rx="10"
          fill={theme === "brand" ? "#fff" : "#7c5cff"}
        />
        <path
          d="M7 12l4 11 5-9 5 9 4.5-14"
          fill="none"
          stroke={theme === "brand" ? "#7c5cff" : "#fff"}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-left leading-tight">
        <span className={`block text-[10px] font-semibold uppercase ${t.sub}`}>
          {label}
          {week ? ` · Week ${week}` : ""}
        </span>
        <span className="block text-sm font-bold">WeekLaunch</span>
      </span>
    </span>
  );
}

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 pr-24 text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            // Clipboard can be blocked; the code is still selectable
          }
        }}
        className="btn-pop absolute right-3 top-3 flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-slate-900"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
