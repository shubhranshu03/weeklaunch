import type { NextRequest } from "next/server";

// The "Launched on WeekLaunch" image makers embed: /badges/<slug>.svg?theme=light
const looks = {
  light: {
    bg: "#faf6ec",
    border: "#1b1813",
    ink: "#1b1813",
    sub: "#6b6255",
    mark: "#b3261e",
    glyph: "#faf6ec",
  },
  dark: {
    bg: "#1b1813",
    border: "#1b1813",
    ink: "#faf6ec",
    sub: "#b8ae9c",
    mark: "#b3261e",
    glyph: "#faf6ec",
  },
  brand: {
    bg: "#b3261e",
    border: "#b3261e",
    ink: "#ffffff",
    sub: "#f6d5d1",
    mark: "#faf6ec",
    glyph: "#b3261e",
  },
};

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/badges/[file]">,
) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9-]{1,60}\.svg$/.test(file))
    return new Response("Not found", { status: 404 });

  const theme = req.nextUrl.searchParams.get("theme");
  const c = looks[theme === "dark" || theme === "brand" ? theme : "light"];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="54" viewBox="0 0 200 54" role="img" aria-label="Launched on WeekLaunch">
<rect x="1" y="1" width="198" height="52" rx="8" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
<rect x="11" y="11" width="32" height="32" rx="6" fill="${c.mark}"/>
<path d="M17 21l4 11 5-9 5 9 4.5-14" fill="none" stroke="${c.glyph}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
<text x="53" y="23" fill="${c.sub}" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="1.2">LAUNCHED ON</text>
<text x="52" y="42" fill="${c.ink}" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700">WeekLaunch</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=604800",
      "access-control-allow-origin": "*",
    },
  });
}
