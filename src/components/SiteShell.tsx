import { Footer } from "./Footer";
import { Masthead } from "./paper/Masthead";
import { RightRail } from "./RightRail";

const sticky =
  "no-scrollbar sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pb-1 pr-1 pt-2";

// Shared newspaper frame: masthead, page content, right column, footer.
// The section links live in the masthead, so there's no left menu.
export function SiteShell({
  children,
  after,
  sidebars = true,
}: {
  children: React.ReactNode;
  // Full-width content shown between the columns and the footer
  after?: React.ReactNode;
  // false = one centered column with no right column
  sidebars?: boolean;
}) {
  return (
    <>
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <Masthead compact />
      </div>
      {sidebars ? (
        <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-10 px-4 pb-16 pt-8 sm:px-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            {children}
            <div className="mt-8 xl:hidden">
              <RightRail />
            </div>
          </main>
          <aside className="hidden xl:block xl:border-l xl:border-ink/40 xl:pl-8">
            <div className={sticky}>
              <RightRail />
            </div>
          </aside>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          <main>{children}</main>
        </div>
      )}
      {after}
      <Footer />
    </>
  );
}
