import type { NextRequest } from "next/server";

// The "Launched on IndieShip" image makers embed: /badges/<slug>.svg?theme=light
const looks = {
  light: {
    bg: "#faf6ec",
    border: "#1b1813",
    ink: "#1b1813",
    sub: "#6b6255",
    mark: "#6a45f5",
    glyph: "#faf6ec",
  },
  dark: {
    bg: "#1b1813",
    border: "#1b1813",
    ink: "#faf6ec",
    sub: "#b8ae9c",
    mark: "#6a45f5",
    glyph: "#faf6ec",
  },
  brand: {
    bg: "#6a45f5",
    border: "#6a45f5",
    ink: "#ffffff",
    sub: "#f6d5d1",
    mark: "#faf6ec",
    glyph: "#6a45f5",
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="54" viewBox="0 0 200 54" role="img" aria-label="Launched on IndieShip">
<rect x="1" y="1" width="198" height="52" rx="8" fill="${c.bg}" stroke="${c.border}" stroke-width="2"/>
<rect x="11" y="11" width="32" height="32" rx="6" fill="${c.mark}"/>
<path d="M16.5 6.5v12h8.2zM14.5 9.5v9H9zM6.5 21h19l-2.8 4.5H9.3z" fill="${c.glyph}" transform="translate(10 9)"/>
<text x="53" y="23" fill="${c.sub}" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="1.2">LAUNCHED ON</text>
<text x="52" y="42" fill="${c.ink}" font-family="Georgia, 'Times New Roman', serif" font-size="19" font-weight="700">IndieShip</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=604800",
      "access-control-allow-origin": "*",
    },
  });
}
