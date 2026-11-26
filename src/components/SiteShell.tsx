import { Suspense } from "react";
import { Footer } from "./Footer";
import { BrowseShell, BrowseShellFallback } from "./home/BrowseShell";

// The frame every page shares with the home page: sponsor tiles (or strips on
// smaller screens), the top bar, the Browse column on the left and the widgets
// on the right, with the page's own content in the middle, then the footer.
export function SiteShell({
  children,
  after,
  sidebars = true,
}: {
  children: React.ReactNode;
  // Full-width content shown between the columns and the footer
  after?: React.ReactNode;
  // Kept for older call sites; every page now has the same columns
  sidebars?: boolean;
}) {
  void sidebars;
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<BrowseShellFallback />}>
        <BrowseShell>{children}</BrowseShell>
      </Suspense>
      {after}
      <Footer />
    </div>
  );
}
