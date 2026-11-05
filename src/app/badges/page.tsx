import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { BadgePreview, CopyCode } from "@/components/LaunchBadge";
import { SiteShell } from "@/components/SiteShell";
import { badgeCode, type BadgeTheme } from "@/lib/badge";

export const metadata: Metadata = {
  title: "Launch badges",
  description:
    "Free badges to show your WeekLaunch launch on your website. Pick a style and copy the code.",
  alternates: { canonical: "/badges" },
};

const styles: { theme: BadgeTheme; name: string; note: string }[] = [
  { theme: "light", name: "Light", note: "For light websites" },
  { theme: "dark", name: "Dark", note: "For dark websites" },
  { theme: "brand", name: "Violet", note: "Stands out anywhere" },
];

export default function BadgesPage() {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: `${SITE_URL}/badges`,
          name: "WeekLaunch launch badges",
          description:
            "Embeddable Launched on WeekLaunch badges for your website.",
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Launch badges
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-500">
          Show visitors you launched on WeekLaunch. Free launches get a dofollow
          backlink once the badge is on your site.
        </p>
        <ol className="mx-auto mt-6 grid max-w-2xl gap-3 text-left text-sm sm:grid-cols-3">
          {[
            "Pick a style below",
            "Copy the code",
            "Paste it in your site's footer",
          ].map((s, i) => (
            <li
              key={s}
              className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <span className="badge-pop flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-xs font-bold text-slate-900">
                {i + 1}
              </span>
              <span className="font-medium text-slate-700">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 space-y-4">
        {styles.map((s) => (
          <section
            key={s.theme}
            aria-label={`${s.name} badge`}
            className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-center"
          >
            <div
              className={`flex flex-col items-center justify-center gap-3 rounded-2xl p-6 ${
                s.theme === "dark" ? "bg-slate-800" : "bg-slate-50"
              }`}
            >
              <BadgePreview theme={s.theme} week={1} />
              <BadgePreview theme={s.theme} label="#1 Product of the week" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900">{s.name}</h2>
              <p className="mb-3 text-sm text-slate-500">{s.note}</p>
              <CopyCode code={badgeCode("your-product", s.theme)} />
              <p className="mt-2 text-xs text-slate-400">
                Replace <code className="font-mono">your-product</code> with
                your product&apos;s name from its WeekLaunch link.
              </p>
            </div>
          </section>
        ))}
      </div>
    </SiteShell>
  );
}
