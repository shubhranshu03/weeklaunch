import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { MakerProfile } from "@/components/MakerProfile";
import { SiteShell } from "@/components/SiteShell";
import { getMaker, getMakerHandles } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  const handles = await getMakerHandles();
  // Cache Components needs at least one; unknown makers show the 404 page
  return handles.length
    ? handles.map((handle) => ({ handle }))
    : [{ handle: "weeklaunch" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/makers/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const found = await getMaker(handle);
  if (!found) return {};
  const { maker, launches } = found;
  const name = maker.name || maker.handle;
  const made = launches.map((p) => p.name).slice(0, 3);
  const description =
    maker.bio ||
    (made.length
      ? `${name} is the maker of ${made.join(", ")}. See their launches, upvotes and links on WeekLaunch.`
      : `${name}'s maker profile on WeekLaunch.`);
  const url = `/makers/${maker.handle}`;
  return {
    title: `${name} (@${maker.handle}) — maker profile`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", url, title: name, description },
    // A profile with nothing launched yet isn't worth listing in search
    robots: launches.length ? undefined : { index: false, follow: true },
  };
}

export default function MakerPage({ params }: PageProps<"/makers/[handle]">) {
  return (
    <SiteShell>
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        All products
      </Link>
      <Suspense
        fallback={
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Maker params={params} />
      </Suspense>
    </SiteShell>
  );
}

async function Maker({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const found = await getMaker(handle);
  if (!found) notFound();
  const { maker, launches } = found;
  const name = maker.name || maker.handle;
  const url = `${SITE_URL}/makers/${maker.handle}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "@id": url,
          url,
          dateCreated: maker.created_at,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          mainEntity: {
            "@type": "Person",
            name,
            alternateName: `@${maker.handle}`,
            ...(maker.bio && { description: maker.bio }),
            ...(maker.avatar_url && { image: maker.avatar_url }),
            ...(maker.location && { homeLocation: maker.location }),
            sameAs: [
              maker.website,
              maker.x_handle && `https://x.com/${maker.x_handle}`,
            ].filter(Boolean),
            // Their launches, linked to each product page
            owns: launches.map((p) => ({
              "@type": "SoftwareApplication",
              name: p.name,
              url: `${SITE_URL}/products/${p.slug}`,
            })),
          },
        }}
      />
      <MakerProfile
        profile={maker}
        launches={launches}
        empty={
          <p className="text-sm text-slate-500">
            {name} hasn&apos;t launched anything yet.
          </p>
        }
      />
    </>
  );
}
