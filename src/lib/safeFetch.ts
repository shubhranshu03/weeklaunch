import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { SITE_URL } from "./site";

// Fetching addresses makers type in: only public websites, never this
// server's own network. Used by the badge check and by autofill.

// Local testing only: lets fetches reach a page on this computer
const allowLocal =
  process.env.NODE_ENV === "development" &&
  process.env.SAFE_FETCH_ALLOW_LOCAL === "1";

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

export type Fetched = { bytes: Buffer; type: string; url: string };

// Fetches a public address, following up to 4 redirects, each one checked.
// Reads at most maxBytes; returns null when it can't be reached.
export async function fetchPublic(
  start: string,
  { accept, maxBytes }: { accept: string; maxBytes: number },
): Promise<Fetched | null> {
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
          "user-agent": `Mozilla/5.0 (compatible; IndieShipBot/1.0; +${SITE_URL}/badges)`,
          accept,
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
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < maxBytes) {
      const { done, value } = await reader.read().catch(() => ({
        done: true as const,
        value: undefined,
      }));
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    await reader.cancel().catch(() => {});
    return {
      bytes: Buffer.concat(chunks).subarray(0, maxBytes),
      type: (res.headers.get("content-type") ?? "").toLowerCase(),
      url: u.toString(),
    };
  }
  return null;
}

// A page's HTML as text, or null
export async function fetchHtml(url: string) {
  const r = await fetchPublic(url, {
    accept: "text/html,application/xhtml+xml",
    maxBytes: 2_000_000,
  });
  return r && { html: new TextDecoder().decode(r.bytes), url: r.url };
}
