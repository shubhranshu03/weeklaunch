import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { Leaderboard } from "@/components/Leaderboard";
import { getBoard, getBoardWeeks } from "@/lib/products";
import { SiteShell } from "@/components/SiteShell";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/#home`,
          url: SITE_URL,
          name: "This week's product launches on WeekLaunch",
          description: SITE_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#website` },
        }}
      />
      <h1 className="sr-only">
        This week&apos;s product launches on WeekLaunch
      </h1>
      <Suspense
        fallback={
          <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200/60" />
        }
      >
        <Board />
      </Suspense>
    </SiteShell>
  );
}

async function Board() {
  const weeks = await getBoardWeeks();
  const board = await getBoard(weeks);
  return <Leaderboard weeks={weeks} board={board} />;
}
