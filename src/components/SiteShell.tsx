import { FeedHeader } from "./FeedHeader";
import { Footer } from "./Footer";
import { LeftNav } from "./LeftNav";
import { RightRail } from "./RightRail";

const sticky =
  "no-scrollbar sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pb-1 pr-1 pt-2";

// Shared three-column frame: left menu, page content, right column, footer
export function SiteShell({
  children,
  after,
  sidebars = true,
}: {
  children: React.ReactNode;
  // Full-width content shown between the columns and the footer
  after?: React.ReactNode;
  // false = one centered column with no left menu or right column
  sidebars?: boolean;
}) {
  if (!sidebars) {
    return (
      <>
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
          <FeedHeader nav={<LeftNav />} sidebars={false} />
          <main className="mt-6">{children}</main>
        </div>
        {after}
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_300px]">
        <aside className="hidden lg:block">
          <div className={sticky}>
            <LeftNav />
          </div>
        </aside>

        <main className="min-w-0">
          <FeedHeader nav={<LeftNav />} />
          <div className="mt-6">{children}</div>
          <div className="mt-6 xl:hidden">
            <RightRail />
          </div>
        </main>

        <aside className="hidden xl:block">
          <div className={sticky}>
            <RightRail />
          </div>
        </aside>
      </div>
      {after}
      <Footer />
    </>
  );
}
