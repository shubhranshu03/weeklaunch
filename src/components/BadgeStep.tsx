"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgeCheck, Code2, Loader2, Sparkles } from "lucide-react";
import { verifyBadge } from "@/lib/actions/badge";
import { badgeCode, badgePrompt, type BadgeTheme } from "@/lib/badge";
import { CopyCode } from "./LaunchBadge";

const themes: { id: BadgeTheme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "brand", label: "Red" },
];

// Free launches: copy the badge (or an AI prompt that adds it), then we check the site
export function BadgeStep({
  productId,
  slug,
  website,
  // Where to go once the badge is found; stays on the page when not set
  next,
}: {
  productId: string;
  slug: string;
  website: string;
  next?: string;
}) {
  const router = useRouter();
  const [theme, setTheme] = useState<BadgeTheme>("light");
  const [tab, setTab] = useState<"code" | "ai">("code");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  const verify = () => {
    setError("");
    startTransition(async () => {
      const res = await verifyBadge(productId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOk(true);
      if (next) router.push(next);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-5 text-left">
      <ol className="grid gap-2 text-sm sm:grid-cols-3">
        {["Copy the badge code", "Add it to your site", "Click Verify"].map(
          (s, i) => (
            <li
              key={s}
              className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2"
            >
              <span className="badge-pop flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-300 text-xs font-bold text-slate-900">
                {i + 1}
              </span>
              <span className="font-medium text-slate-700">{s}</span>
            </li>
          ),
        )}
      </ol>

      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex items-center justify-center rounded-2xl p-4 ${
            theme === "dark" ? "bg-slate-800" : "bg-slate-50"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the exact image makers embed */}
          <img
            src={`/badges/${slug}.svg?theme=${theme}`}
            alt="Launched on WeekLaunch"
            width={200}
            height={54}
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-900">Style</span>
          <div className="mt-1.5 flex gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  theme === t.id
                    ? "badge-pop bg-brand-500 text-white"
                    : "border-[1.5px] border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div role="tablist" className="flex gap-1 border-b border-slate-200">
          {(
            [
              ["code", "Copy the code", Code2],
              ["ai", "Use an AI tool", Sparkles],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold ${
                tab === id
                  ? "border-brand-500 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          {tab === "code" ? (
            <>
              <CopyCode code={badgeCode(slug, theme)} />
              <p className="mt-2 text-xs text-slate-500">
                Paste it in your site&apos;s footer, then publish your site.
              </p>
            </>
          ) : (
            <>
              <CopyCode wrap code={badgePrompt(slug, theme, website)} />
              <p className="mt-2 text-xs text-slate-500">
                Paste this into Cursor, Lovable, Bolt, v0, Claude or ChatGPT. It
                adds the badge in the right place for your kind of site.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[1.5px] border-slate-200 p-4">
        <p className="text-sm text-slate-600">
          Added it? We&apos;ll look for it on{" "}
          <span className="font-semibold text-slate-900">
            {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
          .
        </p>
        <button
          type="button"
          onClick={verify}
          disabled={pending || ok}
          className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-brand-500 px-4 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <BadgeCheck className="size-4" />
          )}
          {ok ? "Verified" : pending ? "Checking your site…" : "Verify badge"}
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
