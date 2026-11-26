import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Pricing, faqs } from "@/components/Pricing";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing — free launches, $29 Premium, ads from $19",
  description:
    "Launch for free or get a Premium launch for $29. Advertise in the center feed for $19 per week or in the right sidebar for $49 per month.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <SiteShell sidebars={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <Pricing />
    </SiteShell>
  );
}
