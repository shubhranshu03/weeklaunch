import { ImageResponse } from "next/og";

export const alt =
  "WeekLaunch — Launch your product. Get discovered every week.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share image for links to the site
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #7c5cff 0%, #4f46e5 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 32 32">
            <path
              d="M7 12l4 11 5-9 5 9 4.5-14"
              fill="none"
              stroke="#7c5cff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>weeklaunch</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
          Launch your product.
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            color: "#fcd34d",
          }}
        >
          Get discovered every week.
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 28 }}>
        {[
          "New board every Monday",
          "Free launches",
          "Permanent product page",
        ].map((t) => (
          <div
            key={t}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
