import type { GetFrom, PriceModel } from "./platforms";

// What autofill can read from a product's home page HTML. Pure, so it's easy to test.
export type SiteInfo = {
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  // Best first: apple-touch-icon, big icons, JSON-LD logo, favicon
  logos: string[];
  // The social preview image, used as the first screenshot
  image: string | null;
  mac: {
    priceModel: PriceModel | null;
    getFrom: GetFrom[];
    appleSilicon: boolean | null;
  } | null;
};

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  middot: "·",
  bull: "•",
  copy: "©",
  reg: "®",
  trade: "™",
};

export function decode(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeChar(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeChar(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m);
}
const safeChar = (n: number) =>
  n > 0 && n < 0x110000 && (n < 0xd800 || n > 0xdfff)
    ? String.fromCodePoint(n)
    : "";

const clean = (s: string | undefined | null) =>
  decode((s ?? "").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

// Attributes of every tag with this name
function tags(html: string, name: string) {
  const out: Record<string, string>[] = [];
  for (const m of html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))) {
    const attrs: Record<string, string> = {};
    for (const a of m[1].matchAll(
      /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g,
    ))
      attrs[a[1].toLowerCase()] = a[2] ?? a[3] ?? a[4] ?? "";
    out.push(attrs);
  }
  return out;
}

// Shortens text to at most max characters, at a word break
function cut(s: string, max: number) {
  if (s.length <= max) return s;
  // Prefer a whole first sentence when it fits
  const sentence = s.match(/^(.{10,}?[.!?])\s/)?.[1];
  if (sentence && sentence.length <= max) return sentence.replace(/[.]$/, "");
  const words = s.slice(0, max + 1).split(" ");
  words.pop();
  return words.join(" ").replace(/[\s,;:–—-]+$/, "") || s.slice(0, max);
}

const titleSplit = /\s+[|–—·:•-]\s+/;

const categoryWords: [string, RegExp][] = [
  [
    "AI",
    /\b(ai|gpt|llm|machine learning|chatbot|agents?|openai|claude|generative)\b/i,
  ],
  [
    "DevTool",
    /\b(api|sdk|developers?|code|coding|deploy|github|cli|database|devops|open[- ]source|debug)\b/i,
  ],
  [
    "Design",
    /\b(design|designers?|figma|mockups?|icons?|fonts?|ui kit|illustrations?|prototyp\w*)\b/i,
  ],
  [
    "Marketing",
    /\b(marketing|seo|landing pages?|newsletters?|email campaigns?|leads?|growth|conversion|ads)\b/i,
  ],
  [
    "Analytics",
    /\b(analytics|dashboards?|metrics|insights|tracking|reports?|charts?)\b/i,
  ],
  [
    "Finance",
    /\b(finance|invoices?|invoicing|budgets?|payments?|accounting|expenses?|taxes|subscriptions?|banking)\b/i,
  ],
  [
    "Social Media",
    /\b(social media|instagram|tiktok|twitter|linkedin|schedul\w+ posts?|followers|creators?)\b/i,
  ],
  [
    "Productivity",
    /\b(productivity|tasks?|to-?do|notes?|calendar|focus|workflow|automat\w+|organi[sz]e|teams?)\b/i,
  ],
];

export function readSite(html: string, pageUrl: string): SiteInfo {
  const head = html.slice(0, 400_000);
  const metas = tags(head, "meta");
  const meta = (...keys: string[]) => {
    for (const k of keys) {
      const m = metas.find(
        (t) => (t.property ?? t.name ?? "").toLowerCase() === k && t.content,
      );
      if (m) return clean(m.content);
    }
    return "";
  };
  const abs = (href: string | undefined) => {
    if (!href) return null;
    try {
      const u = new URL(decode(href.trim()), pageUrl);
      return u.protocol === "https:" || u.protocol === "http:"
        ? u.toString()
        : null;
    } catch {
      return null;
    }
  };

  // JSON-LD often has the cleanest name, description and logo
  let ld: { name?: string; description?: string; logo?: string } = {};
  for (const m of head.matchAll(
    /<script[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const data = JSON.parse(m[1]);
      for (const d of [
        data,
        ...(Array.isArray(data?.["@graph"]) ? data["@graph"] : []),
      ].flat()) {
        if (!d || typeof d !== "object") continue;
        const t = String(d["@type"] ?? "");
        if (
          /SoftwareApplication|WebApplication|MobileApplication|Product|Organization|WebSite/.test(
            t,
          )
        ) {
          const logo = typeof d.logo === "string" ? d.logo : d.logo?.url;
          ld = {
            name: ld.name ?? (typeof d.name === "string" ? d.name : undefined),
            description:
              ld.description ??
              (typeof d.description === "string" ? d.description : undefined),
            logo: ld.logo ?? (typeof logo === "string" ? logo : undefined),
          };
        }
      }
    } catch {
      // Broken JSON-LD is common; ignore it
    }
  }

  const title = clean(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const ogTitle = meta("og:title", "twitter:title");
  const titleParts = (ogTitle || title).split(titleSplit).map((s) => s.trim());

  const name = cut(
    meta("og:site_name", "application-name", "apple-mobile-web-app-title") ||
      clean(ld.name) ||
      titleParts[0] ||
      new URL(pageUrl).hostname.replace(/^www\./, "").split(".")[0],
    40,
  );

  const metaDesc =
    meta("og:description", "description", "twitter:description") ||
    clean(ld.description);
  // The title's other half is often a tagline: "Linear – Plan and build products"
  const titleTag = titleParts
    .slice(1)
    .find(
      (p) =>
        p.length >= 10 &&
        p.length <= 60 &&
        p.toLowerCase() !== name.toLowerCase(),
    );
  const tagline = cut(titleTag || metaDesc || "", 60);

  // Description: the meta text, topped up from the page's heading and first paragraphs
  const body = html.replace(
    /<(script|style|noscript|svg|nav|header|footer)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
  const h1 = clean(body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const paras = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => clean(m[1]))
    .filter(
      (p) =>
        p.length >= 40 &&
        !/cookie|©|all rights reserved/i.test(p) &&
        // Skip code, demo data and changelog-style text
        !/[_{}<>=`]|\w\(\)|\b[a-z]{2,}[A-Z][a-z]+/.test(p),
    );
  // Sentences in order, each only once, with marquee-style repeats folded
  const seen = new Set<string>();
  const sentences: string[] = [];
  for (const b of [
    metaDesc,
    h1 && h1 !== tagline && h1.length > 15 ? h1 : "",
    ...paras.slice(0, 4),
  ]) {
    const folded = b.replace(/(\b.{12,}?)(?:\s+\1\b)+/gi, "$1");
    for (const raw of folded.split(/(?<=[.!?])\s+/)) {
      const line = raw.trim().replace(/[.!?]?$/, (e) => e || ".");
      const key = line
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (key.length < 12 || seen.has(key)) continue;
      // Lead-ins to a list or demo, and sample times like 12:30
      if (/:\.?$/.test(raw.trim()) || /\d:\d\d/.test(raw)) continue;
      // Skip one that only repeats a longer sentence we already have
      if ([...seen].some((k) => k.includes(key) || key.includes(k))) continue;
      seen.add(key);
      sentences.push(line);
    }
  }
  // The first few whole sentences: the top of a page says what the product is.
  // Kept short, since text further down is often demos and jokes.
  let description = "";
  for (const line of sentences.slice(0, 4)) {
    const next = description ? `${description} ${line}` : line;
    if (next.length > 350) break;
    description = next;
  }
  if (!description && sentences[0]) description = cut(sentences[0], 500);

  // Icons, best first
  const links = tags(head, "link");
  const icons = links
    .filter((l) =>
      /(^|\s)(apple-touch-icon(-precomposed)?|icon|shortcut icon)(\s|$)/i.test(
        l.rel ?? "",
      ),
    )
    .map((l) => ({
      href: abs(l.href),
      touch: /apple-touch/i.test(l.rel ?? ""),
      size: Math.max(
        0,
        ...(l.sizes ?? "").split(/\s+/).map((s) => parseInt(s, 10) || 0),
      ),
      svg: /\.svg(\?|$)/i.test(l.href ?? "") || /svg/i.test(l.type ?? ""),
      ico: /\.ico(\?|$)/i.test(l.href ?? ""),
    }))
    .filter((i) => i.href && !i.svg && !i.ico)
    .sort((a, b) => Number(b.touch) - Number(a.touch) || b.size - a.size);
  const logos = [
    ...icons.map((i) => i.href!),
    abs(ld.logo),
    abs("/apple-touch-icon.png"),
  ].filter((x, i, a): x is string => !!x && a.indexOf(x) === i);

  const image = abs(
    meta(
      "og:image:secure_url",
      "og:image",
      "twitter:image",
      "twitter:image:src",
    ) || undefined,
  );

  // Mac app signs: .dmg downloads, Mac App Store links, Homebrew casks
  const text = clean(body).slice(0, 200_000);
  const hrefs = tags(html, "a").map((a) => a.href ?? "");
  const dmg =
    hrefs.some((h) => /\.dmg(\?|#|$)/i.test(h)) ||
    /download for mac/i.test(text);
  const macStore =
    hrefs.some(
      (h) => /apps\.apple\.com\/.*\/app\//i.test(h) && /mac|mt=12/i.test(h),
    ) || /mac app store/i.test(text);
  const brew = /brew install/i.test(text);
  let mac: SiteInfo["mac"] = null;
  if (
    dmg ||
    macStore ||
    brew ||
    /\b(for|on) (macos|your mac)\b|menu bar app/i.test(text)
  ) {
    const getFrom: GetFrom[] = [];
    if (macStore) getFrom.push("app_store");
    if (dmg) getFrom.push("download");
    if (brew) getFrom.push("homebrew");
    const free = /\bfree\b/i.test(text);
    const priced = /[$€£]\s?\d/.test(text);
    mac = {
      priceModel:
        free && priced ? "freemium" : priced ? "paid" : free ? "free" : null,
      getFrom,
      appleSilicon: /apple silicon|\bm[1-4]\b|universal (binary|app)/i.test(
        text,
      )
        ? true
        : null,
    };
  }

  // Categories: up to two whose words show up most in the main text
  const sample = `${name} ${tagline} ${description} ${meta("keywords")}`;
  const categories = categoryWords
    .map(([cat, re]) => ({
      cat,
      n: (sample.match(new RegExp(re.source, "gi")) ?? []).length,
    }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 2)
    .map((c) => c.cat);

  return { name, tagline, description, categories, logos, image, mac };
}
