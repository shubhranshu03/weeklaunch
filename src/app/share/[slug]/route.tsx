import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getUpcomingLaunch } from "@/lib/products";
import { weekStart } from "@/lib/weeks";

// Drawn at twice the usual 1200 × 630, so it stays sharp on high-density screens
const S = 2;
const px = (n: number) => n * S;

// The WeekLaunch mark, same as the site's logo
const logoMark = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9f85ff"/><stop offset="1" stop-color="#5a32db"/></linearGradient></defs><rect width="32" height="32" rx="10" fill="url(#g)"/><path d="M7 12l4 11 5-9 5 9 4.5-14" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.3 10.5 25.5 7l1.4 4.6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
).toString("base64")}`;

// The site's own font, loaded once per server
const fonts = Promise.all(
  (["Regular", "SemiBold", "Bold"] as const).map(async (w) => ({
    name: "Geist",
    data: await readFile(join(process.cwd(), `assets/fonts/Geist-${w}.ttf`)),
    weight: ({ Regular: 400, SemiBold: 600, Bold: 700 } as const)[w],
    style: "normal" as const,
  })),
);

// The branded card makers post on social media: /share/<slug>
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const launch = await getUpcomingLaunch(slug);
  if (!launch) return new Response("Not found", { status: 404 });

  const date = weekStart(launch.week).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  // The font only has plain letters, so symbol logos fall back to the initial
  const glyph = /^[\w@]+$/.test(launch.logo.glyph)
    ? launch.logo.glyph
    : launch.name[0];
  const badge = launch.live
    ? `Live now · Week ${launch.week}`
    : `Launching ${date} · Week ${launch.week}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background:
          "linear-gradient(135deg, #8b6dff 0%, #6d4dfa 45%, #4f46e5 100%)",
        fontFamily: "Geist",
        color: "white",
      }}
    >
      {/* Soft background circles, like the site's banners */}
      <div
        style={{
          position: "absolute",
          top: px(-140),
          right: px(-120),
          width: px(460),
          height: px(460),
          borderRadius: 9999,
          background: "rgba(255,255,255,0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: px(-180),
          left: px(380),
          width: px(380),
          height: px(380),
          borderRadius: 9999,
          background: "rgba(255,255,255,0.07)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: px(64),
        }}
      >
        {/* Brand and launch date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: px(14),
              padding: `${px(10)}px ${px(22)}px ${px(10)}px ${px(10)}px`,
              borderRadius: px(20),
              background: "white",
              boxShadow: `0 ${px(6)}px ${px(24)}px rgba(15,23,42,0.18)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the share image */}
            <img src={logoMark} width={px(48)} height={px(48)} alt="" />
            <div
              style={{
                fontSize: px(32),
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: px(-0.5),
              }}
            >
              weeklaunch
            </div>
          </div>
          <div
            style={{
              display: "flex",
              padding: `${px(12)}px ${px(22)}px`,
              borderRadius: px(16),
              border: `${px(3)}px solid #0f172a`,
              boxShadow: `${px(4)}px ${px(4)}px 0 #0f172a`,
              background: "#fcd34d",
              color: "#0f172a",
              fontSize: px(26),
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        </div>

        {/* The product */}
        <div style={{ display: "flex", alignItems: "center", gap: px(44) }}>
          {launch.logo.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- rendered into the share image
            <img
              src={launch.logo.url}
              width={px(176)}
              height={px(176)}
              style={{
                borderRadius: 9999,
                border: `${px(6)}px solid white`,
                objectFit: "cover",
                background: "white",
              }}
              alt=""
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: px(176),
                height: px(176),
                borderRadius: 9999,
                border: `${px(6)}px solid white`,
                background: `linear-gradient(135deg, ${launch.logo.from}, ${launch.logo.to})`,
                color: launch.logo.fg ?? "white",
                fontSize: px(72),
                fontWeight: 700,
              }}
            >
              {glyph}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: px(launch.name.length > 18 ? 64 : 80),
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: px(-2),
              }}
            >
              {launch.name}
            </div>
            <div
              style={{
                marginTop: px(16),
                fontSize: px(36),
                fontWeight: 400,
                lineHeight: 1.3,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              {launch.tagline}
            </div>
          </div>
        </div>

        {/* Maker and call to action */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: px(26),
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {`Made by ${launch.maker.name}`}
          </div>
          <div
            style={{
              display: "flex",
              padding: `${px(16)}px ${px(28)}px`,
              borderRadius: px(18),
              background: "white",
              border: `${px(3)}px solid #0f172a`,
              boxShadow: `${px(4)}px ${px(4)}px 0 #0f172a`,
              color: "#4f46e5",
              fontSize: px(28),
              fontWeight: 700,
            }}
          >
            {launch.live
              ? "Upvote it on weeklaunch ▲"
              : "Support it on weeklaunch ▲"}
          </div>
        </div>
      </div>
    </div>,
    {
      width: px(1200),
      height: px(630),
      fonts: await fonts,
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}
