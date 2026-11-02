import type { Metadata } from "next";
import { Pricing } from "@/components/Pricing";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Pricing — WeekLaunch",
  description:
    "Launch for free or get a Premium launch for $29. Advertise in the center feed for $19 per week or in the right sidebar for $49 per month.",
};

export default function PricingPage() {
  return (
    <SiteShell sidebars={false}>
      <Pricing />
    </SiteShell>
  );
}
