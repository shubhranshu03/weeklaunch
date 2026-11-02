import type { Metadata } from "next";
import { ProductsDirectory } from "@/components/ProductsDirectory";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "All products — WeekLaunch",
  description:
    "Browse every product launched on WeekLaunch, grouped by category: AI, productivity, developer tools, design, marketing and more.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <ProductsDirectory />
    </SiteShell>
  );
}
