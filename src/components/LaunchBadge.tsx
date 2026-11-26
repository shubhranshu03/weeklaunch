"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import type { BadgeTheme } from "@/lib/badge";
import { dayLabel } from "@/lib/days";

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
  day: week,
}: {
  theme?: BadgeTheme;
  label?: string;
  day?: number;
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
        <path d="M16.5 6.5v12h8.2zM14.5 9.5v9H9zM6.5 21h19l-2.8 4.5H9.3z" fill={theme === "brand" ? "#7c5cff" : "#fff"}/>
      </svg>
      <span className="text-left leading-tight">
        <span className={`block text-[10px] font-semibold uppercase ${t.sub}`}>
          {label}
          {week ? ` · ${dayLabel(week, { weekday: false })}` : ""}
        </span>
        <span className="block text-sm font-bold">IndieShip</span>
      </span>
    </span>
  );
}

export function CopyCode({
  code,
  wrap = false,
}: {
  code: string;
  wrap?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative">
      <pre
        className={`rounded-xl bg-slate-900 p-4 pr-24 text-xs leading-relaxed text-slate-100 ${
          wrap
            ? "max-h-72 overflow-y-auto whitespace-pre-wrap break-words"
            : "overflow-x-auto"
        }`}
      >
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
