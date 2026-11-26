import "server-only";
import { fetchHtml } from "./safeFetch";
import { SITE_URL } from "./site";

// Our own addresses a badge link may point at
const ourHosts = new Set(
  [new URL(SITE_URL).hostname, "weeklaunch.vercel.app", "weeklaunch.com"].map(
    (h) => h.replace(/^www\./, ""),
  ),
);

// True when the page links to this launch's IndieShip page
export function hasBadge(html: string, slug: string) {
  const want = `/products/${slug}`.toLowerCase();
  for (const m of html.matchAll(
    /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
  )) {
    const raw = (m[1] ?? m[2] ?? m[3] ?? "").replace(/&amp;/g, "&").trim();
    try {
      const u = new URL(raw);
      if (
        ourHosts.has(u.hostname.replace(/^www\./, "")) &&
        u.pathname.replace(/\/+$/, "").toLowerCase() === want
      )
        return true;
    } catch {
      // Relative or broken links can't point at us
    }
  }
  return false;
}

export type BadgeCheck = "found" | "missing" | "unreachable";

// Looks for the badge on the launch's website, then on its home page
export async function findBadge(
  website: string,
  slug: string,
): Promise<BadgeCheck> {
  const pages = [website];
  try {
    const home = new URL("/", website).toString();
    if (home.replace(/\/$/, "") !== website.replace(/\/$/, ""))
      pages.push(home);
  } catch {
    return "unreachable";
  }
  let reached = false;
  for (const page of pages) {
    const page_ = await fetchHtml(page);
    if (!page_) continue;
    reached = true;
    if (hasBadge(page_.html, slug)) return "found";
  }
  return reached ? "missing" : "unreachable";
}
