"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Download, Loader2, Rocket, Share2 } from "lucide-react";
import { claimShareBoost } from "@/lib/actions/share";
import {
  platformOf,
  SHARES_NEEDED,
  sharePlatforms,
  sharePost,
} from "@/lib/share";
import { weekStart } from "@/lib/weeks";

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

// Share card, ready-made posts and the "share on 3 platforms" boost
export function ShareKit({
  productId,
  slug,
  name,
  tagline,
  website,
  week,
  free,
  siteUrl,
  sharedLinks = [],
}: {
  productId: string;
  slug: string;
  name: string;
  tagline: string;
  // The maker's own product site, linked in the post
  website: string;
  week: number;
  free: boolean;
  siteUrl: string;
  sharedLinks?: string[];
}) {
  const router = useRouter();
  const link = `${siteUrl}/products/${slug}`;
  const card = `/share/${slug}`;
  const date = weekStart(week).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const [text, setText] = useState(() =>
    sharePost(name, tagline, date, website),
  );
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<string[]>(
    sharedLinks.length ? sharedLinks : ["", "", ""],
  );
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(
    sharedLinks.length
      ? {
          ok: true,
          text: "Thanks for sharing! Your launch is in the fast lane.",
        }
      : null,
  );
  const [pending, startTransition] = useTransition();

  // Live count of different platforms in the links typed so far
  const platforms = new Set(
    links.map((l) => platformOf(l)?.id).filter(Boolean),
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-5 text-left">
      {/* 1. The card */}
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Share2 className="size-4 text-brand-600" />
          Your share card
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated share image */}
        <img
          src={card}
          alt={`${name} launching on WeekLaunch`}
          className="mt-2 aspect-[1200/630] w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover"
        />
        <a
          href={card}
          download={`${slug}-weeklaunch.png`}
          className="btn-pop mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900"
        >
          <Download className="size-3.5" />
          Download image
        </a>
      </div>

      {/* 2. The post */}
      <div>
        <label className="block">
          <span className="text-sm font-semibold text-slate-900">
            Your post
          </span>
          <textarea
            className={`${input} mt-1.5 h-32 resize-none py-3`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
        </label>
        <p className="mt-1 truncate text-xs text-slate-400">
          + your WeekLaunch page: {link}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="btn-pop flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy post"}
          </button>
          {sharePlatforms
            .filter((p) => p.intent)
            .map((p) => (
              <a
                key={p.id}
                href={p.intent!(text, link)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pop flex h-9 items-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Share on {p.name}
              </a>
            ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">
          LinkedIn and Facebook only take the link: copy the post first, then
          paste it in. Add the card image for more clicks.
        </p>
      </div>

      {/* 3. The boost */}
      <form
        className="rounded-2xl border-[1.5px] border-amber-300 bg-amber-50/60 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(null);
          startTransition(async () => {
            const res = await claimShareBoost(productId, links);
            if (!res.ok) {
              setResult({ ok: false, text: res.error });
              return;
            }
            setResult({
              ok: true,
              text: res.moved
                ? `You're in the fast lane: your launch moved up to Week ${res.week} and will be reviewed first.`
                : "Thanks for sharing! Your launch will be reviewed first.",
            });
            router.refresh();
          });
        }}
      >
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Rocket className="size-4 text-amber-600" />
          Share on {SHARES_NEEDED} platforms, launch sooner
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          Post on {SHARES_NEEDED} different platforms and paste the links here.
          {free
            ? " Your launch moves up to the next open week and is reviewed first."
            : " Your launch is reviewed first."}
        </p>
        <ul className="mt-3 space-y-2">
          {links.map((l, i) => {
            const p = l.trim() ? platformOf(l) : null;
            return (
              <li key={i} className="flex items-center gap-2">
                <input
                  className={input}
                  type="url"
                  value={l}
                  placeholder={`Link to post ${i + 1}, e.g. https://x.com/you/status/…`}
                  onChange={(e) =>
                    setLinks(
                      links.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                />
                <span
                  className={`w-20 shrink-0 text-xs font-semibold ${
                    p
                      ? "text-emerald-700"
                      : l.trim()
                        ? "text-rose-600"
                        : "text-slate-300"
                  }`}
                >
                  {p ? `✓ ${p.name}` : l.trim() ? "Not a post" : "—"}
                </span>
              </li>
            );
          })}
        </ul>
        {links.length < 6 && (
          <button
            type="button"
            onClick={() => setLinks([...links, ""])}
            className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
          >
            + Add another link
          </button>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-600">
            {Math.min(platforms.size, SHARES_NEEDED)} of {SHARES_NEEDED}{" "}
            platforms
          </span>
          <button
            type="submit"
            disabled={pending || platforms.size < SHARES_NEEDED}
            className="btn-pop flex h-10 items-center gap-1.5 rounded-xl bg-amber-300 px-4 text-sm font-bold text-slate-900 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Move me up
          </button>
        </div>
        {result && (
          <p
            role="status"
            className={`mt-3 rounded-xl px-3 py-2 text-sm ${
              result.ok
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {result.text}
          </p>
        )}
      </form>
    </div>
  );
}
