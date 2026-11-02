import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Leaderboard } from "@/components/Leaderboard";
import { SiteShell } from "@/components/SiteShell";
import { Testimonials } from "@/components/Testimonials";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <SiteShell after={<Testimonials />}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: SITE_NAME,
              description: SITE_DESCRIPTION,
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/icon.svg`,
            },
          ],
        }}
      />
      <h1 className="sr-only">
        This week&apos;s product launches on WeekLaunch
      </h1>
      <Leaderboard />
    </SiteShell>
  );
}
