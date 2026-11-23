import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { SITE_URL } from "./site";

// Our own addresses a badge link may point at
const ourHosts = new Set(
  [new URL(SITE_URL).hostname, "weeklaunch.vercel.app", "weeklaunch.com"].map(
    (h) => h.replace(/^www\./, ""),
  ),
);

// True when the page links to this launch's WeekLaunch page
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

// Local testing only: lets the check reach a page on this computer
const allowLocal =
  process.env.NODE_ENV === "development" &&
  process.env.BADGE_CHECK_ALLOW_LOCAL === "1";

function privateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return privateIp(v.slice(7));
  if (isIP(v) === 4) {
    const [a, b] = v.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  return (
    v === "::" ||
    v === "::1" ||
    v.startsWith("fc") ||
    v.startsWith("fd") ||
    v.startsWith("fe80")
  );
}

// Only public web addresses: never this server's own network
async function publicUrl(raw: string) {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  if (allowLocal) return u;
  if (u.port && u.port !== "80" && u.port !== "443") return null;
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    /\.(localhost|local|internal|lan|home|test)$/.test(host)
  )
    return null;
  const addrs = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => []);
  if (addrs.length === 0 || addrs.some((a) => privateIp(a.address)))
    return null;
  return u;
}

const MAX_BYTES = 2_000_000;

// Fetches a page's HTML, following up to 4 redirects, each one checked
async function fetchPage(start: string): Promise<string | null> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    const u = await publicUrl(url);
    if (!u) return null;
    let res: Response;
    try {
      res = await fetch(u, {
        redirect: "manual",
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
        headers: {
          "user-agent": `Mozilla/5.0 (compatible; WeekLaunchBadgeCheck/1.0; +${SITE_URL}/badges)`,
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      return null;
    }
    if (res.status >= 300 && res.status < 400) {
      const to = res.headers.get("location");
      await res.body?.cancel();
      if (!to) return null;
      url = new URL(to, u).toString();
      continue;
    }
    if (!res.ok || !res.body) return null;
    // Read at most MAX_BYTES
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => {});
    return new TextDecoder().decode(Buffer.concat(chunks));
  }
  return null;
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
    const html = await fetchPage(page);
    if (html === null) continue;
    reached = true;
    if (hasBadge(html, slug)) return "found";
  }
  return reached ? "missing" : "unreachable";
}
