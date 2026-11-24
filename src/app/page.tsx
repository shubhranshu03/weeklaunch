import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/Footer";
import { FrontPage } from "@/components/paper/FrontPage";
import { Masthead } from "@/components/paper/Masthead";
import {
  getBoard,
  getBoardWeeks,
  getWeekSpace,
  getLastWeekBest,
} from "@/lib/products";
import { getSidebarAds } from "@/lib/sidebarAds";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The home page is laid out as a weekly newspaper front page
export default function Home() {
  return (
    <div
      className="flex flex-1 flex-col bg-paper"
    >
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
      <div className="mx-auto w-full max-w-[1320px] flex-1 px-4 pb-20 sm:px-6">
        <Masthead />
        <Suspense
          fallback={
            <div className="mt-8 h-[600px] animate-pulse bg-paper-dark/60" />
          }
        >
          <Edition />
        </Suspense>
      </div>
      <Footer cta={false} />
    </div>
  );
}

async function Edition() {
  const weeks = await getBoardWeeks();
  const [board, lastWeek, space, ads] = await Promise.all([
    getBoard(weeks),
    getLastWeekBest(),
    getWeekSpace(weeks),
    getSidebarAds(),
  ]);
  return (
    <FrontPage
      weeks={weeks}
      board={board}
      lastWeek={lastWeek}
      space={space}
      ads={ads}
    />
  );
}
