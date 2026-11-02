"use client";

import { useState } from "react";
import { Globe, ImageIcon } from "lucide-react";
import { CopyCode } from "../LaunchBadge";

type Meta = {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
};

const example: Meta = {
  title: "RocketNotes — Turn meetings into clear notes",
  description:
    "RocketNotes records your meetings and turns them into clean notes and action items, so busy teams never miss a decision. Free for small teams.",
  url: "https://rocketnotes.app",
  image: "",
  siteName: "RocketNotes",
};

const input =
  "h-11 w-full rounded-xl border-[1.5px] border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-brand-100";

const cut = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function host(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "yourproduct.com";
  }
}

// Green when in the ideal range, amber when short, red when too long
function LengthHint({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const tone =
    length > max
      ? "text-rose-600"
      : length < min
        ? "text-amber-700"
        : "text-emerald-700";
  const label =
    length > max
      ? "too long — Google will cut it"
      : length < min
        ? "a bit short"
        : "good length";
  return (
    <span className={`text-xs font-medium ${tone}`}>
      {length}/{max} · {label}
    </span>
  );
}

function SharePlaceholder({ m }: { m: Meta }) {
  return (
    <div className="flex aspect-[1200/630] w-full items-center justify-center bg-gradient-to-br from-brand-500 to-indigo-600 p-4 text-center">
      <span className="flex flex-col items-center gap-1 text-white">
        <ImageIcon className="size-6 opacity-70" />
        <span className="line-clamp-2 text-sm font-semibold">
          {m.title || "Your share image"}
        </span>
      </span>
    </div>
  );
}

function ShareImage({ m }: { m: Meta }) {
  if (!m.image) return <SharePlaceholder m={m} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- preview of a user-provided image URL
    <img
      src={m.image}
      alt=""
      className="aspect-[1200/630] w-full bg-slate-100 object-cover"
    />
  );
}

export function MetaTagGenerator() {
  const [m, setM] = useState<Meta>(example);
  const set = (k: keyof Meta, v: string) => setM((s) => ({ ...s, [k]: v }));

  const code = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    m.url && `<link rel="canonical" href="${esc(m.url)}" />`,
    "",
    "<!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->",
    `<meta property="og:type" content="website" />`,
    m.siteName &&
      `<meta property="og:site_name" content="${esc(m.siteName)}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    m.url && `<meta property="og:url" content="${esc(m.url)}" />`,
    m.image && `<meta property="og:image" content="${esc(m.image)}" />`,
    "",
    "<!-- X (Twitter) -->",
    `<meta name="twitter:card" content="${m.image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    m.image && `<meta name="twitter:image" content="${esc(m.image)}" />`,
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
          <label className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">
                Page title
              </span>
              <LengthHint length={m.title.length} min={30} max={60} />
            </span>
            <input
              className={`${input} mt-1.5`}
              value={m.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={120}
            />
          </label>
          <label className="block">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-slate-900">
                Description
              </span>
              <LengthHint length={m.description.length} min={70} max={160} />
            </span>
            <textarea
              className={`${input} mt-1.5 h-28 resize-none py-3`}
              value={m.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={300}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Page URL
            </span>
            <input
              className={`${input} mt-1.5`}
              type="url"
              value={m.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://yourproduct.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Share image URL
              <span className="ml-1 font-normal text-slate-400">
                (1200×630 recommended)
              </span>
            </span>
            <input
              className={`${input} mt-1.5`}
              type="url"
              value={m.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://yourproduct.com/og.png"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-900">
              Site name
            </span>
            <input
              className={`${input} mt-1.5`}
              value={m.siteName}
              onChange={(e) => set("siteName", e.target.value)}
            />
          </label>
        </div>

        {/* Previews */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Google
            </p>
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Globe className="size-4" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm text-slate-800">
                  {m.siteName || host(m.url)}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {m.url || "https://yourproduct.com"}
                </span>
              </span>
            </div>
            <p className="mt-2 text-lg leading-snug text-[#1a0dab]">
              {cut(m.title || "Your page title", 60)}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {cut(m.description || "Your description shows here.", 160)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                X (Twitter)
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <ShareImage m={m} />
              </div>
              <p className="mt-1.5 truncate text-xs text-slate-500">
                From {host(m.url)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                LinkedIn
              </p>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <ShareImage m={m} />
                <div className="bg-slate-50 px-3 py-2">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {m.title || "Your page title"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {host(m.url)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-slate-900">Your meta tags</h2>
        <p className="mb-3 mt-1 text-sm text-slate-500">
          Paste this inside the <code className="font-mono">&lt;head&gt;</code>{" "}
          of your page.
        </p>
        <CopyCode code={code} />
      </div>
    </div>
  );
}
