import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./JsonLd";
import { SiteShell } from "./SiteShell";

// Simple text page layout for About, Terms, Privacy and similar
export function InfoPage({
  title,
  intro,
  updated,
  path,
  type = "WebPage",
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  // The page's address, e.g. "/about", for its structured data
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage";
  children: React.ReactNode;
}) {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": type,
          url: `${SITE_URL}${path}`,
          name: title,
          ...(intro && { description: intro }),
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <article className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {updated && (
          <p className="mt-1 text-xs text-slate-400">Last updated {updated}</p>
        )}
        {intro && <p className="mt-3 text-lg text-slate-500">{intro}</p>}
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-slate-600 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
          {children}
        </div>
      </article>
    </SiteShell>
  );
}
